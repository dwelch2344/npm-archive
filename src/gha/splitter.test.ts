import { it } from 'vitest'
import { splitJobs } from './splitter'
import { processBatch } from './joiner'
it('splits', async() => {
  // await splitJobs()
  await processBatch('batch_1.json')
})