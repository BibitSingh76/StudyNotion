const database = require('../config/database');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Course = require('../models/Course');

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply') || process.env.APPLY === 'true';

  console.log('Connecting to database...');
  await database.connect();
  console.log('Connected.');

  try {
    // Build map categoryId -> array of published course ids
    // Only consider courses with status "Published" to keep Category.courses aligned with public courses
    const allPublishedCourses = await Course.find({ status: 'Published' }).select('_id category status').lean().exec();

    const categoryMap = new Map();
    for (const course of allPublishedCourses) {
      const catId = course.category ? String(course.category) : null;
      if (!catId) continue;
      if (!categoryMap.has(catId)) categoryMap.set(catId, new Set());
      categoryMap.get(catId).add(String(course._id));
    }

    const allCategories = await Category.find().select('_id courses name').lean().exec();

    const summary = [];

    for (const cat of allCategories) {
      const catId = String(cat._id);
      const current = Array.isArray(cat.courses) ? cat.courses.map((id) => String(id)) : [];
      const expectedSet = categoryMap.get(catId) || new Set();
      const expected = Array.from(expectedSet);

      const toAdd = expected.filter((id) => !current.includes(id));
      const toRemove = current.filter((id) => !expected.includes(id));

      summary.push({ categoryId: catId, name: cat.name, currentCount: current.length, expectedCount: expected.length, toAddCount: toAdd.length, toRemoveCount: toRemove.length });

      if (toAdd.length === 0 && toRemove.length === 0) continue;

      console.log(`Category ${cat.name} (${catId}): current=${current.length} expected=${expected.length} +${toAdd.length} -${toRemove.length}`);
      if (!apply) {
        if (toAdd.length) console.log('  Would add:', toAdd.slice(0, 10));
        if (toRemove.length) console.log('  Would remove:', toRemove.slice(0, 10));
      } else {
        // Replace the courses array with expected list
        await Category.findByIdAndUpdate(catId, { courses: expected }).exec();
        console.log('  Applied update.');
      }
    }

    console.log('\nSummary:');
    for (const s of summary) {
      console.log(`- ${s.name} (${s.categoryId}): current=${s.currentCount} expected=${s.expectedCount} +${s.toAddCount} -${s.toRemoveCount}`);
    }

    if (!apply) {
      console.log('\nDry-run mode (no changes applied). To apply changes run with `--apply` or set env APPLY=true`.');
    } else {
      console.log('\nApplied changes successfully.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  } finally {
    // close mongoose connection
    try { await mongoose.connection.close(); } catch (e) {}
  }
}

main();
