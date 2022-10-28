"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_ssh_1 = require("node-ssh");
const core = __importStar(require("@actions/core"));
const fs = require('fs');
/*
    * Connect to the remote server

    * @param {NodeSSH} ssh - The ssh connection
    * @param {string} host - The host to connect to
    * @param {string} username - The username to connect with
    * @param {string} password - The password to connect with
    * @param {string} port - The port to connect to

    *Promise<NodeSSH> - The ssh connection
*/
let connect = (ssh, host, username, password, port) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        ssh.connect({ host, username, password, port }).then((sshCon) => resolve(sshCon));
        setTimeout(() => reject('Connection timeout'), 5000);
    });
});
/*
    * Execute for uploading a directory into remote server
    * @param sshCon: SSH connection
    * @param source: Source directory
    * @param target: Target directory

    * Promise<string> - The result of the upload
*/
let upload = (ssh, source, target) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const localDir = process.cwd() + source;
            if (!fs.existsSync(localDir))
                reject('Source folder does not exist');
            const { stdout: distPath } = yield ssh.execCommand('pwd');
            const { code } = yield ssh.execCommand('cd .' + target);
            if (code !== 0)
                reject('Target folder does not exist');
            const remoteDir = distPath + target;
            yield ssh.putDirectory(localDir, remoteDir, { recursive: true });
            resolve('Upload successful');
        }
        catch (error) {
            reject(error);
        }
    }));
});
/*
    * Execute on start to connect & upload the directory specified in the remote server
*/
let run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ssh = new node_ssh_1.NodeSSH();
        core.info('Devploy - Connecting to remote server');
        let sshCon = yield connect(ssh, core.getInput('host'), core.getInput('username'), core.getInput('password'), parseInt(core.getInput('port')));
        core.info('Devploy - Upload to remote server');
        yield upload(sshCon, core.getInput('source'), core.getInput('target'));
        if (core.getInput('execute') !== '')
            yield sshCon.execCommand(core.getInput('execute'));
        core.setOutput('AutoDeploy', 'All is fine');
        process.exit(0);
    }
    catch (error) {
        core.setFailed(error);
        process.exit(1);
    }
});
run();
//# sourceMappingURL=index.js.map