#!/usr/bin/env node

/**
 * Local Comic Data Seeder Script
 * 
 * This script reads the dev_comics directory and seeds the database with comic data.
 * For local testing only - no production data changes.
 * 
 * Usage: node scripts/seedDevComics.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from '../backend/src/config/database.js';
import { User, Comic, Page } from '../backend/src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to dev_comics directory
const DEV_COMICS_DIR = path.join(__dirname, '..', 'dev_comics');

/**
 * Read and parse metadata.json from a comic directory
 * @param {string} comicDir - Path to comic directory
 * @returns {Object|null} Parsed metadata or null if error
 */
function readComicMetadata(comicDir) {
  try {
    const metadataPath = path.join(comicDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠️  No metadata.json found in ${comicDir}`);
      return null;
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);

    // Validate required fields
    if (!metadata.title || !metadata.author || !metadata.pages) {
      console.warn(`⚠️  Invalid metadata in ${comicDir}: missing required fields`);
      return null;
    }

    return metadata;
  } catch (error) {
    console.error(`❌ Error reading metadata from ${comicDir}:`, error.message);
    return null;
  }
}

/**
 * Validate that page files exist in the comic directory
 * @param {string} comicDir - Path to comic directory
 * @param {Array} pageFiles - Array of page filenames
 * @returns {Array} Array of existing page file paths
 */
function validatePageFiles(comicDir, pageFiles) {
  const validPages = [];
  
  for (const pageFile of pageFiles) {
    const pagePath = path.join(comicDir, pageFile);
    if (fs.existsSync(pagePath)) {
      validPages.push(pagePath);
    } else {
      console.warn(`⚠️  Page file not found: ${pagePath}`);
    }
  }
  
  return validPages;
}

/**
 * Seed a single comic into the database
 * @param {Object} metadata - Comic metadata
 * @param {string} comicDirName - Name of the comic directory
 * @param {string} comicDir - Full path to comic directory
 * @param {Object} uploader - User object who will be the uploader
 */
async function seedComic(metadata, comicDirName, comicDir, uploader) {
  try {
    console.log(`📚 Seeding comic: ${metadata.title}`);

    // Validate page files exist
    const validPagePaths = validatePageFiles(comicDir, metadata.pages);
    
    if (validPagePaths.length === 0) {
      console.warn(`⚠️  No valid page files found for ${metadata.title}, skipping...`);
      return;
    }

    // Create comic record
    const [comic, created] = await Comic.findOrCreate({
      where: { 
        title: metadata.title,
        uploaderId: uploader.id 
      },
      defaults: {
        title: metadata.title,
        description: metadata.description || '',
        author: metadata.author,
        tags: metadata.tags || [],
        pageCount: validPagePaths.length,
        fileName: `${comicDirName}.zip`, // Simulated filename
        fileSize: validPagePaths.length * 1024 * 1024, // Simulated file size (1MB per page)
        fileType: 'application/zip',
        s3Key: `comics/dev/${comicDirName}/${comicDirName}.zip`,
        s3Url: `https://fake-s3-url.com/comics/dev/${comicDirName}/${comicDirName}.zip`,
        thumbnailS3Key: `comics/dev/${comicDirName}/thumbnail.jpg`,
        thumbnailS3Url: `https://fake-s3-url.com/comics/dev/${comicDirName}/thumbnail.jpg`,
        publishStatus: 'published',
        publishedAt: new Date(),
        isPublic: true,
        isActive: true,
        uploaderId: uploader.id,
      },
    });

    if (created) {
      console.log(`✅ Created comic: ${comic.title}`);
      
      // Create page records for each page
      for (let i = 0; i < validPagePaths.length; i++) {
        const pagePath = validPagePaths[i];
        const pageNumber = i + 1;
        
        await Page.create({
          pageNumber,
          imagePath: pagePath,
          imageS3Key: `comics/dev/${comicDirName}/pages/page-${pageNumber.toString().padStart(3, '0')}.jpg`,
          imageS3Url: `https://fake-s3-url.com/comics/dev/${comicDirName}/pages/page-${pageNumber.toString().padStart(3, '0')}.jpg`,
          comicId: comic.id,
        });
      }
      
      console.log(`📄 Created ${validPagePaths.length} pages for ${comic.title}`);
    } else {
      console.log(`📚 Comic already exists: ${comic.title}`);
    }

  } catch (error) {
    console.error(`❌ Error seeding comic ${metadata.title}:`, error);
  }
}

/**
 * Main seeding function
 */
async function seedDevComics() {
  try {
    console.log('🌱 Starting dev comics seeding...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Check if dev_comics directory exists
    if (!fs.existsSync(DEV_COMICS_DIR)) {
      console.error(`❌ Dev comics directory not found: ${DEV_COMICS_DIR}`);
      console.log('💡 Create the dev_comics directory and add comic folders with metadata.json files');
      process.exit(1);
    }

    // Get or create a default uploader user
    const [uploader] = await User.findOrCreate({
      where: { email: 'dev-seeder@comicstop.local' },
      defaults: {
        username: 'dev-seeder',
        email: 'dev-seeder@comicstop.local',
        password: 'DevSeeder123!',
        firstName: 'Dev',
        lastName: 'Seeder',
        isCreator: true,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log(`👤 Using uploader: ${uploader.username}`);

    // Read comic directories
    const comicDirs = fs.readdirSync(DEV_COMICS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (comicDirs.length === 0) {
      console.warn('⚠️  No comic directories found in dev_comics/');
      console.log('💡 Create subdirectories in dev_comics/ with metadata.json files');
      process.exit(0);
    }

    console.log(`📁 Found ${comicDirs.length} comic directories`);

    // Process each comic directory
    for (const comicDirName of comicDirs) {
      const comicDirPath = path.join(DEV_COMICS_DIR, comicDirName);
      console.log(`\n📂 Processing: ${comicDirName}`);

      // Read metadata
      const metadata = readComicMetadata(comicDirPath);
      if (!metadata) {
        console.log(`❌ Skipping ${comicDirName} due to metadata issues`);
        continue;
      }

      // Seed the comic
      await seedComic(metadata, comicDirName, comicDirPath, uploader);
    }

    console.log('\n🎉 Dev comics seeding completed successfully!');
    console.log(`📊 Total directories processed: ${comicDirs.length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

/**
 * Run the seeder if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDevComics()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}