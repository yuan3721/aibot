const path = require('path');
const { readFileSync, writeFileSync, readdirSync } = require('fs');
console.log('trycatch checking',path.join(__dirname, '../dist/assets'))
//修改文件
function replaceCatch(pathName) {
    const newContent = readFileSync(pathName).toString().replace(/catch{/g, 'catch(e){');
    writeFileSync(pathName, newContent);
}

const dirents = readdirSync(path.join(__dirname, '../dist/assets'), {
    withFileTypes: true
})

dirents.forEach(v => {
    if (v.name.slice(-3) === '.js') {
        replaceCatch(path.join(__dirname, '../dist/assets/', v.name))
    }
})
