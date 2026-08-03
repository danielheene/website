/**
 *    The date helpers assert absolute ISO strings, so the suite has to run in a
 *    fixed zone regardless of the developer's machine or the CI runner.
 */
process.env.TZ = 'UTC'
