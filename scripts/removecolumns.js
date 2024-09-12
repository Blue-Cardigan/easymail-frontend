import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const inputFile = 'lib/pcd-constituency.csv';
const outputFile = 'lib/cleaned-pcd-constituency.csv';

const results = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (data) => {
    const { pcd, pconnm } = data;
    results.push({ pcd, pconnm });
  })
  .on('end', () => {
    const csvWriter = createCsvWriter({
      path: outputFile,
      header: [
        { id: 'pcd', title: 'pcd' },
        { id: 'pconnm', title: 'pconnm' }
      ]
    });

    csvWriter.writeRecords(results)
      .then(() => console.log('CSV file has been cleaned and saved.'));
  });