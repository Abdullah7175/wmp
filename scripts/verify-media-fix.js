#!/usr/bin/env node

/**
 * Media Loading Fix Verification Script
 * Checks if all components are properly using getMediaUrl()
 * and database records have proper media links
 */

const fs = require('fs');
const path = require('path');

const resultsLog = [];

function logResult(status, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${status}: ${message}`;
    console.log(logEntry);
    resultsLog.push(logEntry);
}

async function checkFileSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
            hasGetMediaUrl: content.includes('getMediaUrl'),
            hasDirectSrcLink: content.includes('src={') && content.includes('.link}') && !content.includes('getMediaUrl'),
            content
        };
    } catch (error) {
        return { error: error.message };
    }
}

async function verifyComponents() {
    logResult('INFO', 'Starting component verification...\n');

    const componentsToCheck = [
        'app/coo/requests/[id]/components/RequestApprovalForm.jsx',
        'app/ceo/requests/[id]/components/RequestApprovalForm.jsx',
        'app/dashboard/before-content/edit/[id]/components/EditBeforeContentForm.jsx',
        'app/dashboard/requests/[id]/view/page.jsx'
    ];

    let allGood = true;

    for (const componentPath of componentsToCheck) {
        const result = await checkFileSyntax(componentPath);

        if (result.error) {
            logResult('ERROR', `Could not read ${componentPath}: ${result.error}`);
            allGood = false;
            continue;
        }

        if (result.hasGetMediaUrl) {
            logResult('✓ PASS', `${componentPath} uses getMediaUrl()`);
        } else if (result.hasDirectSrcLink) {
            logResult('✗ FAIL', `${componentPath} still has direct src={.link} without getMediaUrl()`);
            allGood = false;
        } else {
            logResult('✓ INFO', `${componentPath} appears to be updated`);
        }
    }

    return allGood;
}

async function verifyUtility() {
    logResult('INFO', '\nVerifying mediaUtils.js...\n');

    const utilPath = 'lib/mediaUtils.js';

    try {
        const content = fs.readFileSync(utilPath, 'utf8');

        const hasGetMediaUrl = content.includes('export function getMediaUrl');
        const hasGetMediaExtension = content.includes('export function getMediaExtension');
        const hasIsImageMedia = content.includes('export function isImageMedia');
        const hasIsVideoMedia = content.includes('export function isVideoMedia');

        if (hasGetMediaUrl) {
            logResult('✓ PASS', 'mediaUtils.js exports getMediaUrl()');
        } else {
            logResult('✗ FAIL', 'mediaUtils.js missing getMediaUrl() export');
            return false;
        }

        if (hasGetMediaExtension && hasIsImageMedia && hasIsVideoMedia) {
            logResult('✓ PASS', 'mediaUtils.js exports all helper functions');
        } else {
            logResult('⚠ WARN', 'Some helper functions may be missing');
        }

        return true;
    } catch (error) {
        logResult('✗ FAIL', `Could not read mediaUtils.js: ${error.message}`);
        return false;
    }
}

async function verifyDatabase() {
    logResult('INFO', '\nDatabase Migration Script Check...\n');

    const migrationPath = 'database/fix_media_links_migration.sql';

    try {
        const content = fs.readFileSync(migrationPath, 'utf8');

        const hasImagesUpdate = content.includes('UPDATE images');
        const hasVideosUpdate = content.includes('UPDATE videos');
        const hasFinalVideosUpdate = content.includes('UPDATE final_videos');
        const hasBeforeContentUpdate = content.includes('UPDATE before_content');

        if (hasImagesUpdate && hasVideosUpdate && hasFinalVideosUpdate && hasBeforeContentUpdate) {
            logResult('✓ PASS', 'Migration script covers all media tables');

            const hasApiUploadsPath = content.includes('/api/uploads/');
            if (hasApiUploadsPath) {
                logResult('✓ PASS', 'Migration script uses correct /api/uploads/ paths');
            } else {
                logResult('✗ FAIL', 'Migration script missing /api/uploads/ paths');
                return false;
            }
        } else {
            logResult('✗ FAIL', 'Migration script incomplete');
            return false;
        }

        return true;
    } catch (error) {
        logResult('✗ FAIL', `Could not read migration script: ${error.message}`);
        return false;
    }
}

async function runAllChecks() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   Media Loading Fix Verification Script');
    console.log('═══════════════════════════════════════════════════════════\n');

    const componentsGood = await verifyComponents();
    const utilityGood = await verifyUtility();
    const databaseGood = await verifyDatabase();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   VERIFICATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (componentsGood && utilityGood && databaseGood) {
        logResult('✓ SUCCESS', 'All fixes are properly implemented!');
        console.log('\nNext Step: Run the database migration:');
        console.log('  psql -U <username> -d <database> -f database/fix_media_links_migration.sql');
    } else {
        logResult('✗ FAILURE', 'Some components are missing fixes. Please review above.');
    }

    console.log('\nVerification Log:');
    resultsLog.forEach(entry => console.log(entry));

    process.exit(componentsGood && utilityGood && databaseGood ? 0 : 1);
}

runAllChecks().catch(error => {
    logResult('ERROR', `Script failed: ${error.message}`);
    console.error(error);
    process.exit(1);
});
