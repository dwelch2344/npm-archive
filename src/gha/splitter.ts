import shell from 'shelljs'
import execa from 'execa'
import path from 'node:path'
import { chunk } from 'lodash'
import { promises as fs } from 'node:fs'

export async function splitJobs(){

  const rootRaw = await fs.readFile(path.join('config', 'matrix.json'), 'utf8')
  const root = JSON.parse(rootRaw)

  const all = root.include
  const len = all.length

  const chunks = chunk(all, 256)
  const chunkFile = (idx: number) => `batch_${idx + 1}.json`
  
  await execa('mkdir', ['-p', path.join('tmp', 'jobs')])
  await Promise.all(chunks.map( 
    (chunk, idx) => 
      fs.writeFile(path.join('tmp', 'jobs', chunkFile(idx)), JSON.stringify(chunk, null, 2), 'utf8')
    )
  )

  const matrix = { include: chunks.map( (_,idx) => ({ file: chunkFile(idx) })) }
  return matrix
}

if( !process.env.VITEST ){
  console.log(JSON.stringify(splitJobs()))
}
