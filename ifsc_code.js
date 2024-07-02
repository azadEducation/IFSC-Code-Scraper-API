const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const readdirAsync = promisify(fs.readdir);
const path = require('path');
const xlsx = require('xlsx');
const BankIFSCCode = require('./Model/bank_ifsc_codes');

const baseURL = 'https://www.rbi.org.in';

async function scrapeXLSLinks() {
  try {
    const url = `${baseURL}/Scripts/bs_viewcontent.aspx?Id=2009`;

    // Make a GET request to the URL
    const response = await axios.get(url);

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data);

    // Extract all links with the .xls extension
    const xlsLinks = [];
    $('a[href$=".xlsx"]').each((index, element) => {
      const xlsLink = $(element).attr('href');
      const bankName = $(element).text(); // Use .text() instead of .attr('text')
      xlsLinks.push({ link: xlsLink, name: bankName }); // Store link and name in an object
    });


    // Create a folder to store downloaded files
    const folderPath = './ifsc_code_files';
    await mkdirAsync(folderPath, { recursive: true });
    // Get the list of files already in the folder
    const existingFiles = await readdirAsync(folderPath);

    // Filter out links that correspond to existing files
    const newXlsLinks = await xlsLinks.filter((xlsLink, index) => {
      const fileName = `${xlsLink.name}.xls`;
      return !existingFiles.includes(fileName);
    });

    // console.log(newXlsLinks);
    // Download each Excel file and save it in the folder
    const downloadPromises = newXlsLinks.map(async (xlsLink, index) => {
      const fileName = `${xlsLink.name}.xls`;
      const filePath = path.join(folderPath, fileName);

      const fileResponse = await axios.get(xlsLink.link, { responseType: 'arraybuffer' });
      await writeFileAsync(filePath, fileResponse.data);

      console.log(`Downloaded: ${fileName}`);
    });

    // Wait for all download promises to complete
    await Promise.all(downloadPromises);

    console.log('All files downloaded successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function to initiate the scraping and downloading process
// scrapeXLSLinks();

async function convertExcelToJson(inputFolderPath, outputFolderPath) {
  try {
    // Create the output folder if it doesn't exist
    await mkdirAsync(outputFolderPath, { recursive: true });

    // Get the list of files in the input folder
    const files = await readdirAsync(inputFolderPath);

    // Loop through each file and convert to JSON
    const jsonPromises = files.map(async (file) => {
      const inputFilePath = path.join(inputFolderPath, file);

      // Load the Excel workbook
      const workbook = xlsx.readFile(inputFilePath);

      // Assume that we are interested in the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet to JSON in key-value pair format
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Extract the header row for keys
      const keys = jsonData[0];

      // Remove the first row (header) from the data
      jsonData.shift();

      // Map each row to an object using keys
      const formattedData = jsonData.map((row) => {
        const obj = {};
        keys.forEach((key, index) => {
          obj[key] = row[index];
        });
        return obj;
      });

      // Write the formatted JSON data to a new file in the output folder
      const outputFilePath = path.join(outputFolderPath, `${path.parse(file).name}.json`);
      await fs.promises.writeFile(outputFilePath, JSON.stringify(formattedData, null, 2));

      console.log(`Converted: ${file} to ${path.parse(file).name}.json`);
    });

    // Wait for all conversion promises to complete
    await Promise.all(jsonPromises);

    console.log('All files converted to JSON successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage
const inputFolderPath = path.join(__dirname, 'ifsc_code_files');
const outputFolderPath = path.join(__dirname, 'ifsc__code_json_files');
// convertExcelToJson(inputFolderPath, outputFolderPath);
async function fetchAndInsertIFSCData(ifsc) {
  try {
    const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
    const data = response.data;

    let ifscCodeInsert = {
      ifsc_code: ifsc,
      bank: data['BANK'],
      branch: data['BRANCH'],
      address: data['ADDRESS'],
      state: data['STATE'],
      district: data['DISTRICT'],
      contact: data['CONTACT'],
      bank_code: data['BANKCODE'],
      micr: data['MICR'],
    }
    await BankIFSCCode.create(ifscCodeInsert);
    console.log(`Inserted data for IFSC code: ${ifsc}`);
  } catch (error) {
    console.error(`Error fetching/inserting data for IFSC code: ${ifsc}`, error);
  }
}

async function insertIFSCData() {
  try {
    // Sync the model with the database

    const files = fs.readdirSync(outputFolderPath);

    for (const file of files) {
      const filePath = path.join(outputFolderPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data.length > 0) {
        let bankCode = data[0]['IFSC'].substr(0, 4);
        BankIFSCCode.destroy({
          where: {
            bank_code: bankCode
          }
        });
        const filePromises = data.map(ifscCode => fetchAndInsertIFSCData(ifscCode['IFSC']));
        await Promise.all(filePromises);

        // for (const ifscCode of data) {
        //   await fetchAndInsertIFSCData(ifscCode['IFSC'])

        // }
        console.log('Updated IFSC code', file);
      }
    }

    console.log('IFSC code data inserted successfully.');
  } catch (error) {
    console.error('Error inserting IFSC code data:', error);
  } finally {
    // Close the database connection
  }
}

insertIFSCData();


