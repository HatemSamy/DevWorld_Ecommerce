import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import connectDB from '../config/database.js';

dotenv.config();

/**
 * Generate slugs for all existing products
 */
const generateSlugs = async () => {
    try {
        console.log('Starting slug generation for existing products...\n');

        await connectDB();

        const products = await Product.find({});
        console.log(`Found ${products.length} products in database\n`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            try {
                if (product.slug) {
                    console.log(`Skipped: "${product.name.en}" (already has slug: ${product.slug})`);
                    skippedCount++;
                    continue;
                }

                await product.save();

                console.log(`Generated slug for: "${product.name.en}" -> ${product.slug}`);
                successCount++;
            } catch (error) {
                console.error(`Error generating slug for "${product.name.en}":`, error.message);
                errorCount++;
            }
        }

        console.log('\n========================================');
        console.log('MIGRATION SUMMARY');
        console.log('========================================');
        console.log(`Successfully generated: ${successCount}`);
        console.log(`Skipped (already had slug): ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log(`Total products: ${products.length}`);
        console.log('========================================\n');

        if (errorCount === 0) {
            console.log('Slug generation completed successfully!\n');
        } else {
            console.log('Slug generation completed with errors. Please review the logs above.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('Fatal error during slug generation:', error);
        process.exit(1);
    }
};

generateSlugs();

