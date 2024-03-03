process.env.TZ = 'UTC' 

import fetch from 'node-fetch-commonjs'
import { subDays, formatDate, formatISO, subYears, startOfYear, eachMonthOfInterval, endOfMonth } from 'date-fns'
// import { format, utcToZonedTime } from "date-fns-tz";

import path from 'node:path'
import execa from 'execa'
import shell from 'shelljs'
import { promises as fs } from 'node:fs'

export async function getManifest(pkg: string){
  const req = await fetch(`https://registry.npmjs.com/${encode(pkg)}`)
  const body = await req.json()
  return body as Record<string, any>
}

export async function getVersionsLastWeek(pkg: string){
  const encoded = encode(pkg)
  const result = await fetch(`https://api.npmjs.org/versions/${encoded}/last-week`)
  const body = await result.json() as any

  body.end = new Date()
  body.start = subDays(body.end, 7)
  
  return body as Record<string, any>
}

async function getYearlies(pkg: string){
  const encoded = encode(pkg)

  const now = new Date()
  const fya = subYears(now, 1)
  const startOfFYA = startOfYear(fya)

  const interval = {
    start: startOfFYA,
    end: now,
  };
  const months = eachMonthOfInterval(interval);
  const targets = months.map(start => ({ 
    start: formatDate(start, 'yyyy-MM-dd'), 
    end: formatDate(endOfMonth(start), 'yyyy-MM-dd')
  }))

  const results = await Promise.all(
    targets.map(t => 
      fetch(`https://api.npmjs.org/downloads/range/${t.start}:${t.end}/jquery`)
        .then(res => res.json() as any)
        .then(stats => ({
          ...stats, 
          month: stats.start.substring(0, 7)
        }))
    )
  )

  
  return results
}

export async function syncPackage(pkg: string){
  const encoded = encode(pkg)
  const basePath = path.join('data', 'npm',encoded, '')
  await execa('mkdir', ['-p', path.join(basePath, 'stats')])
  await execa('mkdir', ['-p', path.join(basePath, 'historical')])
  
  const now = new Date()
  const ts = formatDate(now, 'yyyy-MM-dd_hh-mm-ss')

  const [
      manifest, 
      weekly,
      yearlies
    ] = await Promise.all([
    getManifest(pkg),
    getVersionsLastWeek(pkg),
    getYearlies(pkg)
  ])

  

  await Promise.all([
    fs.writeFile(path.join(basePath, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8'),
    fs.writeFile(path.join(basePath, 'stats', ts + '.json'), JSON.stringify(weekly, null, 2), 'utf8'),
    ...yearlies.map(y => 
      fs.writeFile(path.join(basePath, 'historical', y.month + '.json'), JSON.stringify(y, null, 2), 'utf8'),
    )
  ])
}

export async function blah(){

  // console.log(format(utcToZonedTime(new Date(), 'UTC'), 
  //   'yyyy-MM-dd', 
  //   { timeZone: 'UTC' }
  // ))
}


function encode(pkg: string){
  return pkg?.replaceAll('/', '%2F')
}

function decode(pkg: string){
  return pkg?.replaceAll('%2F', '/')
}