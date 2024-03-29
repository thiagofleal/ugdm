import * as child_process from "child_process";

export async function exec(command, options) {
  return await new Promise((resolve, reject) => {
    child_process.exec(command, {
      ...options
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ error, stdout, stderr });
      }
    });
  });
}
