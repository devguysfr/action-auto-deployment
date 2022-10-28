import { NodeSSH } from "node-ssh";
import * as core from '@actions/core';

const fs = require('fs')

/*
    * Connect to the remote server

    * @param {NodeSSH} ssh - The ssh connection
    * @param {string} host - The host to connect to
    * @param {string} username - The username to connect with
    * @param {string} password - The password to connect with
    * @param {string} port - The port to connect to

    *Promise<NodeSSH> - The ssh connection
*/

let connect = async (ssh: NodeSSH, host: string, username: string, password: string, port: number) => new Promise<NodeSSH>((resolve, reject) => {
    ssh.connect({ host, username, password, port }).then((sshCon) => resolve(sshCon));
    setTimeout(() => reject('Connection timeout'), 5000);
})

/*
    * Execute for uploading a directory into remote server
    * @param sshCon: SSH connection
    * @param source: Source directory
    * @param target: Target directory

    * Promise<string> - The result of the upload
*/
let upload = async (ssh: NodeSSH, source: string, target: string) => new Promise<string>(async (resolve, reject) => {
    try {
        const localDir = process.cwd() + source;
        if (!fs.existsSync(localDir)) reject ('Source folder does not exist')
        const { stdout: distPath } = await ssh.execCommand('pwd');
        const { code } = await ssh.execCommand('cd .' + target);
        if (code !== 0) reject ('Target folder does not exist')
        const remoteDir = distPath + target;
        await ssh.putDirectory(localDir, remoteDir, { recursive: true })
        resolve ('Upload successful');
    } catch (error) {
        reject (error);
    }
})

let run = async () => {
    try {
        const ssh = new NodeSSH();
        core.info('Devploy - Connecting to remote server');
        core.info('Devploy - Host: ' + core.getInput('host'));
        core.info('Devploy - Username: ' + core.getInput('username'));
        core.info('Devploy - Password: ' + core.getInput('password'));
        let sshCon = await connect(ssh, core.getInput('host'), core.getInput('username'), core.getInput('password'), parseInt(core.getInput('port')));
        core.info('Devploy - Upload to remote server');
        core.info('Devploy - Source: ' + core.getInput('source'));
        core.info('Devploy - Target: ' + core.getInput('target'));
        await upload(sshCon, core.getInput('source'), core.getInput('target'))
        core.setOutput('AutoDeploy', 'All is fine');
        process.exit(0)
    } catch (error) {
        core.setFailed(error as string);
        process.exit(1)
    }
}

run()