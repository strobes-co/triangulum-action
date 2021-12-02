const path = require('path');
const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');


async function run() {
  try {
    // inputs defined in action metadata file(action.yml)
    const fileUrl = core.getInput('download_url');
    const sendToStrobes = core.getInput('send_to_strobes')
    console.log(`Triangulum CLI download URL: ${fileUrl}`)

    // If checkout of code is not done scan can't be performed
    if (!'GITHUB_WORKSPACE' in process.env) {
      throw new Error(
        "Requires a GITHUB_WORKSPACE environment variable(Do checkout before scan)"
      )
    }

    const gitCloneDir = process.env.GITHUB_WORKSPACE
    const configPath = path.join(gitCloneDir, '.triangulum')

    // Download Triangulum CLI from given URL & give it permissions to execute
    const triangulumPath = await tc.downloadTool(fileUrl);
    await exec.exec('chmod', ['+x', triangulumPath]);

    // Add optional send to strobes flag, if enabled will send found
    // vulnerabilities to strobes
    var args = ['--cli', '--cfg', configPath]
    if (sendToStrobes === 'true' || 'True' || 'T' || 't') {
      args.push('--sendtostrobes')
    }

    // Run triangulum CLI Scan
    await exec.exec(triangulumPath, args);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run();