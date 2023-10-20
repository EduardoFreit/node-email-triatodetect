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

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const sendEmailWithAttachment = onRequest(async (request, response) => {
  try {
    dotenv.config();
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: request.body.to,
      subject: request.body.subject,
      text: request.body.text,
      attachments: [
        {
          filename: "image.jpg",
          content: request.body.imageBase64, // A imagem como base64
          encoding: "base64",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    logger.info("Email Enviado Com Sucesso!");
    response.status(200).send();
  } catch (error) {
    logger.error("Email não foi Enviado!");
    response.status(500).send();
  }
});
