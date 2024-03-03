

async function main(){
  const data = await require('./node_modules/npm-high-impact/lib/top.js')
  console.log(data)
}

main()