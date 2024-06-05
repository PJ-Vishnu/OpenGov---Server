import express from "express";
import { Reports } from "../models/citizenReports.js";
import multer from "multer";
import fs from "fs";
import archiver from "archiver";
import { Contract } from "../models/contracts.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/Reports');
    },
    filename: function (req, file, cb) {
        // Generate a random unique identifier
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // Append the unique identifier to the original filename
        cb(null, uniquePrefix + '-' + file.originalname);
    }
});

const report = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Check file type
        if (!file.originalname.match(/\.(pdf|doc|docx|img|jpg|jpeg|mp4)$/)) {
            return cb(new Error('Only Document, Image  or Video files allowed and  files are allowed!'));
        }
        cb(null, true);
    }
});

router.post('/report', report.array('files', 10), async (req, res) => {
    try {
        const { citizenId, contractId, type, report, date } = req.body;
        
        // Check if type is 'media' and validate file formats
        if (type === 'media') {
            const files = req.files;
            const invalidFiles = files.filter(file => !/\.(jpg|jpeg|png|gif|mp4|mov|avi|mkv)$/i.test(file.originalname));
            if (invalidFiles.length > 0) {
                // If invalid files are found, send an error response
                return res.status(400).send({ error: 'Invalid file format. Only images and videos are allowed for media reports.' });
            }
        }

        // Save the report to the database
        const newReport = new Reports({
            citizenId,
            contractId,
            type,
            report,
            date,
            files: req.files.map(file => file.path) // Assuming 'path' contains the file path
        });

        await newReport.save();

        // Send a success response
        res.status(201).send({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while processing the request' });
    }
});

router.get('/getComplaints/:id', async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const contract = await Contract.find({ projectId: id })
            let contractId = contract[0]._id
            console.log(id + '------------------' + contractId);
            const complaints = await Reports.find({ type: 'complaint', contractId: contractId });
            // Formatting data for the frontend
            const formattedComplaints = complaints.map(complaint => {
                return {
                    _id: complaint._id,
                    citizenId: complaint.citizenId,
                    report: complaint.report,
                    date: complaint.date
                };
            });

            const zipPromises = complaints.map(complaint => {
                return new Promise((resolve, reject) => {
                    const zip = archiver('zip', {
                        zlib: { level: 9 } // Sets the compression level
                    });

                    const zipFileName = 'complaint_files by -' + complaint.citizenId + '.zip';
                    const tempZipPath = 'uploads/Temp/' + zipFileName; // Assuming you have a temp directory

                    const output = fs.createWriteStream(tempZipPath);
                    zip.pipe(output);
                    complaint.files.forEach(file => {
                        zip.file(file, { name: file }); // Add each file to the zip
                    });

                    output.on('close', function () {
                        resolve(tempZipPath);
                    });

                    zip.finalize();
                });
            });

            // Wait for all zip creation promises to resolve
            const zipFilePaths = await Promise.all(zipPromises);

            // Sending complaints data along with the zipped file paths
            res.status(200).send({ complaints: formattedComplaints, zipFilePaths });
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Error getting complaints from the database");
    }
});

router.get('/getMedia/:id', async (req, res) => {
    const { id } = req.params
    try {
        const contract = await Contract.find({ projectId: id })
        let contractId = contract[0]._id
        const mediaReports = await Reports.find({ type: 'media', contractId: contractId });
        const mediaData = mediaReports.map(report => {
            const images = report.files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
            const videos = report.files.filter(file => /\.(mp4|mov|avi|mkv)$/i.test(file));

            return {
                citizenId: report.citizenId,
                images,
                videos
            };
        })
        res.status(200).send({ mediaData });

    } catch (error) {
        res.status(200).send(error);
    }

});

export default router;
