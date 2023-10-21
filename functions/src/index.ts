/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();
dotenv.config();

export const sendEmailWithAttachment = onRequest(async (request, response) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const db = admin.firestore();
    const emailsCollection = await db.collection("Emails").listDocuments();
    const listEmail = [];

    for (const emailCol of emailsCollection) {
      const email = await emailCol.get();
      listEmail.push(email.get("email"));
    }

    const emailTo = listEmail.pop();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailTo,
      subject: request.body.data.subject,
      text: request.body.data.text,
      cc: listEmail,
      attachments: [
        {
          filename: "image.jpeg",
          content: request.body.data.imageBase64, // A imagem como base64
          encoding: "base64",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    logger.info("Email Enviado Com Sucesso!");
    response.status(200).send({});
  } catch (error) {
    logger.error("Email não foi Enviado!");
    response.status(500).send({});
  }
});
