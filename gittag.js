const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;

const formatDate = (oDate) => {
  var hours = oDate.getHours();
  var minutes = oDate.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + "" + minutes;
  let sMonth = oDate.getMonth()+1 
  sMonth = sMonth < 10 ? '0' + sMonth: sMonth;
  let sDate = oDate.getDate();
  sDate = sDate < 10 ? '0' + sDate : sDate;
  return (oDate.getFullYear()) + "" + sMonth + "" + sDate + "_" + strTime;  
}

/**
 * Check for unstaged changes in the working tree 
 */
const hasUnstagedChanges = () => {
  return new Promise((resolve, reject) => {
    const result = {};
    const child = spawn('git', ['diff-files', '--'])
    child.on('exit', (code) => {
      //console.log("git diff-files exited with: " + code);
      result.code = code;
      resolve(result);
    })
    child.stdout.on('data', (data) => {
      // there is always an empty line at the end
      result.hasChanges = data.toString().split("\n").length > 1;
      //console.log(`stdout: ${data}`)
    })
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data.toString());
    });
  })
}

/**
 * Check for uncommited changes in the index
 */
const hasUncommitedChanges = () => {
  return new Promise((resolve, reject) => {
    const result = {};
    const child = spawn('git', ['diff-index', '--cached', 'HEAD'])
    child.on('exit', (code) => {
      //console.log("git diff-files exited with: " + code);
      result.code = code;
      resolve(result);
    })
    child.stdout.on('data', (data) => {
      // there is always an empty line at the end
      result.hasChanges = data.toString().split("\n").length > 1;
      //console.log(`stdout: ${data}`)
    })
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data.toString());
    });
  })
}

/**
 * Tag the commit with the current timestamp 
 */
const gitTagWithTimeStamp = () => {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['tag', formatDate(new Date())])
    child.on('exit', (code) => {
      //console.log("git diff-files exited with: " + code);
      resolve(code);
    })
    child.stdout.on('data', (data) => {
      //console.log(`stdout: ${data}`)
    })
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data.toString());
    });
  })
}

const main = async () => {
  let hasUnstaged = await hasUnstagedChanges();
  //console.log(hasUnstaged.hasChanges);
  let hasUncommited = await hasUncommitedChanges();
  //console.log(hasUncommited.hasChanges);

  if(hasUnstaged.hasChanges) {
    console.log('Please add all unstaged files to your git index first');
    process.exit(1)
  }
  if(hasUncommited.hasChanges) {
    console.log('Please commit your changes first')
    process.exit(2)
  }

  let exitCode = gitTagWithTimeStamp();
  process.exit(exitCode);
}

//main();

module.exports = main
