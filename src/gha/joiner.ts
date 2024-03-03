
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { syncPackage } from '../npm/downloader'


export async function processBatch(batchFile: string){
  const filePath = path.join('tmp', 'jobs', batchFile)
  const raw = await fs.readFile(filePath, 'utf8')
  const jobs = JSON.parse(raw)

  for(const job of jobs){
    console.log('[start]', job.pkg)
    await syncPackage(job.pkg)
    console.log('[finish]', job.pkg)
  }
}

;(async function() {
  if( !process.env.VITEST ){
    const file = process.argv[2]
    console.log('[processing]', file)
    await processBatch(file)
  }
})();