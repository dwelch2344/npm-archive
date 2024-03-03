import fetch from 'node-fetch-commonjs'
import { subDays } from 'date-fns'
import { syncPackage } from './npm/downloader'

async function main(){
  const pkg = process.argv[2]
  console.log('Running sync:', pkg)
  await syncPackage(pkg)
}

main()