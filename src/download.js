import ytdl from "ytdl-core";
import { mkdir, unlink } from "node:fs/promises";
import * as fs from "fs";
import * as os from "os";
import ora from "ora";

import { path } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";

import { dirname, join } from "path";
import { fileURLToPath } from "url";

// import { db } from "./folder.js";
import Database from "better-sqlite3";
const db = new Database("folder.db");

const spinner = ora("Download starting. Please wait");

const selection = (url, selection) => {
  selection === "video" ? downloadVideo(url) : downloadAudio(url);
};

//Video Downloads
const downloadVideo = async (url) => {
  try {
    //validate url
    const validUrl = ytdl.validateURL(url);
    if (validUrl) {
      //initializing variables
      let receivedBytes = 0;
      const info = await ytdl.getInfo(url);
      const getTitle = info.videoDetails.title;
      const downloadTitle = `${getTitle.replace(/\W$/g, "")}.mp4`;
      let file;
      let resultFolder;
      //check for custom download folder directory
      let stmt = db.prepare(`SELECT path FROM folder WHERE id = 1`);
      let res = stmt.get();

      if (!res) {
        // if there's no custom directory
        //use default Downloads folder on Home Directory
        fs.access(`${os.homedir()}/Downloads`, (err) => {
          if (err) {
            mkdir(`${os.homedir()}/Downloads`);
          }
        });

        //download video to home directory
        file = fs.createWriteStream(
          `${os.homedir()}/Downloads/${downloadTitle}`
        );
        resultFolder = `${os.homedir()}/Downloads`;
        // //download process
        download(spinner, url, file, receivedBytes, resultFolder);
      } else {
        //if a download folder path is found
        //verify it exists
        fs.access(res.path, (err) => {
          //when the path does not exists
          if (err) {
            console.info(
              "invalid download folder path. set valid path or remove invalid path to use default download folder (Downloads folder in the Home Directory)"
            );
          } else {
            //when the path exists
            //download process starts
            file = fs.createWriteStream(`${res.path}/${downloadTitle}`);
            resultFolder = `${res.path}`;
            // download process
            download(spinner, url, file, receivedBytes, res.path, resultFolder);
          }
        });
        db.close();
      }
    } else {
      // console.info("invalid video url");
      spinner.fail("invalid info");
    }
  } catch (error) {
    // console.info(error);
    spinner.fail("an error occured");
  }
};

//Audio Download
const downloadAudio = async (url) => {
  try {
    //validate url
    const validUrl = ytdl.validateURL(url);
    if (validUrl) {
      //initializing variables
      let receivedBytes = 0;
      const info = await ytdl.getInfo(url);
      const getTitle = info.videoDetails.title;
      const title = `${getTitle.replace(/\W$/g, "")}`;
      const downloadTitle = `${title}.mp4`;
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = join(dirname(__filename) + "/temp");

      //Creating dirname if it doesn't exist
      if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname);
      }
      const tempFile = fs.createWriteStream(`${__dirname}/${downloadTitle}`);
      let outputPath;

      //check for custom download folder directory
      let stmt = db.prepare(`SELECT path FROM folder WHERE id = 1`);
      let res = stmt.get();
      if (!res) {
        // if there's no custom directory
        //use default Downloads folder on Home Directory
        fs.access(`${os.homedir()}/Downloads`, (err) => {
          if (err) {
            mkdir(`${os.homedir()}/Downloads`);
          }
        });

        //download and conversion process
        outputPath = `${os.homedir()}/Downloads/${title}.mp3`;
        downloadForAudio(
          spinner,
          url,
          tempFile,
          receivedBytes,
          title,
          downloadTitle,
          outputPath
        );
      } else {
        //if a download folder path is found
        //verify it exists
        fs.access(res.path, (err) => {
          //when the path does not exists
          if (err) {
            console.info(
              "invalid download folder path. set valid path or delete to use default download folder (Downloads folder in the Home Directory)"
            );
          } else {
            //when the path exists
            //download and conversion process starts
            outputPath = `${res.path}/${title}.mp3`;
            //download process
            downloadForAudio(
              spinner,
              url,
              tempFile,
              receivedBytes,
              title,
              downloadTitle,
              outputPath
            );
          }
        });
        db.close();
      }
    } else {
      // console.info("invalid video url");
      spinner.fail("invalid video url");
    }
  } catch (error) {
    console.log(error);
    // console.info(error);
    spinner.fail("an error occurred");
  }
};

const download = (spinner, url, file, receivedBytes, resultFolder) => {
  spinner.start();
  ytdl(url)
    .addListener("progress", (chunkLength, received, total) => {
      const percentage = received / total;
      receivedBytes += chunkLength;
      spinner.text = `${(percentage * 100).toFixed(2)}% | ${(
        receivedBytes / Math.pow(2, 20)
      ).toFixed(2)} mb downloaded`;
    })
    .pipe(file)
    .on("error", (err) => {
      unlink(file);
      spinner.fail("An error occurred");
    });
  file.on("finish", () => {
    spinner.succeed(`Download complete. Download folder - ${resultFolder}`);
  });
  file.on("error", () => {
    unlink(file);
    spinner.fail("file error");
  });
};

const downloadForAudio = (
  spinner,
  url,
  tempFile,
  receivedBytes,
  title,
  downloadTitle,
  outputPath
) => {
  spinner.start();
  ytdl(url)
    .addListener("progress", (chunkLength, received, total) => {
      const percentage = received / total;
      receivedBytes += chunkLength;
      spinner.text = `${(percentage * 100).toFixed(2)}% | ${(
        receivedBytes / Math.pow(2, 20)
      ).toFixed(2)} mb downloaded`;
    })
    .pipe(tempFile)
    .on("error", (err) => {
      console.log(err);
      unlink(`./src/temp/${downloadTitle}`);
      spinner.fail("An error occurred");
    });
  tempFile.on("finish", () => {
    spinner.succeed(" Video download complete");
    spinner.start("Converting to audio....");
    conversion(title, downloadTitle, outputPath);
  });
  tempFile.on("error", () => {
    unlink(`./src/temp/${downloadTitle}`);
    spinner.fail("file error");
  });
};

const conversion = (title, downloadTitle, outputPath) => {
  fs.access(outputPath, (err) => {
    if (err) {
      const audio = spawn(path, [
        "-i",
        `src/temp/${downloadTitle}`,
        outputPath,
      ]);
      audio
        .on("exit", () => {
          unlink(`src/temp/${downloadTitle}`);
          spinner.succeed(
            `Audio conversion complete. Download Path - ${outputPath}`
          );
        })
        .on("error", () => {
          unlink(outputPath);
          spinner.fail("conversion error");
        });
    } else {
      unlink(`src/temp/${downloadTitle}`);
      spinner.succeed(
        `Audio conversion complete. Download Path - ${outputPath}`
      );
    }
  });
};

export { selection };
//https://www.youtube.com/watch?v=ZgMw__KdjiI
//https://www.youtube.com/watch?v=zhWDdy_5v2w
