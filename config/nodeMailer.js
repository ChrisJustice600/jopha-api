const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();
// Configuration de Nodemailer (Mailtrap)

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  // port: Number(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: "justicemabeladi@gmail.com",
    pass: "zpewnpoojpwovqyd",
    // user: process.env.MAILTRAP_USER || "207640d79cc9a6",
    // pass: process.env.MAILTRAP_PASS || "c37844a25dd7c9",
  },
});

const sendResetEmail = async (email, resetLink) => {
  const emailHTML = `
  <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réinitialisation de mot de passe</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
             color: linear-gradient(90deg, #007BFF, #0056b3);
            text-align: center;
            padding: 20px;
        }
        .header img {
            width: 120px;
            margin-bottom: 15px;
        }
        .body {
            padding: 30px;
            text-align: left;
        }
        .body h1 {
            font-size: 24px;
            margin: 0 0 20px;
            color: inherit;
        }
        .body p {
            line-height: 1.6;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            padding: 15px 25px;
            background: linear-gradient(90deg, #007BFF, #0056b3);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px auto;
            transition: background-color 0.3s;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(90deg, #0056b3, #004494);
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            padding: 20px;
            background-color: #f1f1f1;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
           <h1>Réinitialisez votre mot de passe</h1>
        </div>
        <div class="body">
            <p>Bonjour,</p>
            <p>Nous avons reçu une demande pour réinitialiser votre mot de passe. Si c'est bien vous, cliquez sur le bouton ci-dessous pour reprendre le contrôle de votre compte :</p>
            <div style="text-align: center;">
                 <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>

            </div>
             <p>Si vous n'êtes pas à l'origine de cette demande, pas de panique ! Il vous suffit d'ignorer cet e-mail.</p>
            <p>À très bientôt,<br>L'équipe JOPHA CARGO</p>
        </div>
        <div class="footer">
            <p>Vous recevez cet e-mail car vous avez demandé une réinitialisation de mot de passe pour votre compte.</p>
            <p>&copy; 2024 JOPHA CARGO FRET EXPRESS. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>

  `;

  try {
    await transporter.sendMail({
      from: "no-reply@enywork.com", // Adresse personnalisée
      to: email,
      subject: "Réinitialisation de mot de passe",
      html: emailHTML,
    });
  } catch (err) {
    console.error("Erreur d'envoi d'e-mail :", err.message);
    throw new Error("Échec de l'envoi de l'e-mail.");
  }
};

const sendPasswordChangedEmail = async (email) => {
  const emailHTML = `
  <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Mot de passe modifié</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            color: linear-gradient(90deg, #007BFF, #0056b3);
            text-align: center;
            padding: 20px;
        }
        .header img {
            width: 120px;
            margin-bottom: 15px;
        }
        .body {
            padding: 30px;
            text-align: left;
        }
        .body h1 {
            font-size: 24px;
            margin: 0 0 20px;
            color: inherit;
        }
        .body p {
            line-height: 1.6;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            padding: 15px 25px;
            background: linear-gradient(90deg, #007BFF, #0056b3);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px auto;
            transition: background-color 0.3s;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(90deg, #0056b3, #004494);
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            padding: 20px;
            background-color: #f1f1f1;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
                 <h1>Mot de passe modifié</h1>
        </div>
        <div class="body">
            <p>Bonjour,</p>
           <p>Nous vous informons que votre mot de passe a été modifié avec succès.</p>
              <p>Si vous n'êtes pas à l'origine de cette demande, pas de panique ! Il vous suffit d'ignorer cet e-mail.</p>
            <p>À très bientôt,<br>L'équipe JOPHA CARGO</p>
        </div>
        <div class="footer">
            <p>Vous recevez cet e-mail car vous avez demandé une réinitialisation de mot de passe pour votre compte.</p>
            <p>&copy; 2024 JOPHA CARGO FRET EXPRESS. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: "no-reply@enywork.com", // Adresse personnalisée
      to: email,
      subject: "Confirmation de modification de mot de passe",
      html: emailHTML,
    });
  } catch (err) {
    console.error("Erreur d'envoi d'e-mail de confirmation :", err.message);
    throw new Error("Échec de l'envoi de l'e-mail de confirmation.");
  }
};

const sendAccountCreatedEmail = async (email, password) => {
  const emailHTML = `
     <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Bienvenue sur Jopha Management</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff; /* Couleur de fond explicite */
              color: #333333; /* Texte par défaut en couleur sombre */
          }
          .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #dddddd; /* Bordure pour contraste */
          }
          .header {
              background: #007BFF; /* Couleur explicite, adaptée aux deux modes */
              color: #ffffff; /* Texte en blanc */
              text-align: center;
              padding: 20px;
          }
          .header img {
              width: 120px;
              margin-bottom: 15px;
          }
          .body {
              padding: 30px;
              text-align: left;
          }
          .body h1 {
              font-size: 24px;
              margin: 0 0 20px;
              color: #333333; /* Couleur de texte explicite */
          }
          .body p, .body ul li {
              line-height: 1.6;
              margin: 10px 0;
              color: #333333; /* Texte toujours sombre */
          }
          .button {
              display: inline-block;
              padding: 15px 25px;
              background: #0056b3; /* Couleur bleue fixe */
              color: #ffffff !important; /* Texte toujours blanc */
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              margin: 20px auto;
              transition: background-color 0.3s;
              text-align: center;
          }
          .button:hover {
              background: #004494; /* Variante plus sombre au survol */
          }
          .footer {
              text-align: center;
              font-size: 12px;
              color: #666666; /* Texte gris foncé */
              padding: 20px;
              background-color: #f9f9f9; /* Couleur claire pour contraste */
          }
          @media (prefers-color-scheme: dark) {
              body {
                  background-color: #1a1a1a; /* Fond sombre */
                  color: #f5f5f5; /* Texte clair */
              }
              .container {
                  background: #2a2a2a; /* Fond sombre pour le container */
                  border-color: #444444; /* Bordure plus foncée */
              }
              .header {
                  background: #1f78d1; /* Couleur adaptée au mode sombre */
              }
              .body h1 {
                  color: #f5f5f5; /* Texte toujours lisible */
              }
              .body p, .body ul li {
                  color: #cccccc; /* Texte clair */
              }
              .footer {
                  background-color: #333333; /* Fond sombre pour le pied de page */
                  color: #bbbbbb; /* Texte clair */
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
               <h1>Bienvenue sur Jopha Management</h1>
          </div>
          <div class="body">
              <p>Bonjour,</p>
              <p>Nous sommes ravis de vous accueillir sur Jopha Managemnt! Votre compte a été créé avec succès.</p>
              <p>Voici quelques informations importantes :</p>
              <ul>
                  <li><strong>Email de connexion :</strong> ${email}</li>
                  <li><strong>Mot de passe par défaut :</strong> ${password}</li>
                  <li><strong>Connectez-vous :</strong> <a href="https://jopha-front.vercel.app/" style="color: #1e90ff; text-decoration: underline;">OptSolution</a></li>
              </ul>
              <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
              <p>À très bientôt,<br>L'équipe Jopha support</p>
          </div>
          <div class="footer">
              <p>Vous recevez cet e-mail car un compte a été créé pour vous sur Jopha  Management.</p>
            <p>&copy; 2024 JOPHA CARGO FRET EXPRESS. Tous droits réservés.</p>
          </div>
      </div>
  </body>
  </html>
      `;

  try {
    await transporter.sendMail({
      from: "no-reply@enywork.com", // Adresse personnalisée
      to: email,
      subject: "Bienvenue sur OptSolution - Votre compte a été créé",
      html: emailHTML,
    });
  } catch (err) {
    console.error("Erreur d'envoi d'e-mail de bienvenue :", err.message);
    throw new Error("Échec de l'envoi de l'e-mail de bienvenue.");
  }
};

module.exports = {
  transporter,
  sendAccountCreatedEmail,
  sendPasswordChangedEmail,
  sendResetEmail,
};
