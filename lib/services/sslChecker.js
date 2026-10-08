/**
 * SSL / TLS Certificate Checker Service
 *
 * Connects to HTTPS endpoints via Node.js tls.connect to inspect
 * certificate expiration, issuer, and validity.
 */

const tls = require('tls');
const { URL } = require('url');

/**
 * Checks SSL certificate for a given URL
 * @param {string} urlStr - Target website URL
 * @param {number} timeout - Connection timeout in ms
 * @returns {Promise<Object>} Certificate health information
 */
async function checkSSLCertificate(urlStr, timeout = 5000) {
  return new Promise((resolve) => {
    try {
      if (!urlStr) {
        return resolve({ hasSSL: false, error: 'No URL provided' });
      }

      const parsedUrl = new URL(urlStr);
      if (parsedUrl.protocol !== 'https:') {
        return resolve({ hasSSL: false, message: 'Non-HTTPS protocol' });
      }

      const host = parsedUrl.hostname;
      const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 443;

      const socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: false,
          timeout,
        },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            socket.destroy();

            if (!cert || !cert.valid_to) {
              return resolve({
                hasSSL: true,
                valid: false,
                error: 'No peer certificate returned',
              });
            }

            const validFrom = new Date(cert.valid_from);
            const validTo = new Date(cert.valid_to);
            const now = new Date();
            const daysRemaining = Math.floor(
              (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

            const isExpired = daysRemaining <= 0;
            const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 14;

            resolve({
              hasSSL: true,
              valid: !isExpired,
              isExpired,
              isExpiringSoon,
              daysRemaining,
              validFrom: validFrom.toISOString(),
              validTo: validTo.toISOString(),
              issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown CA',
              subject: cert.subject?.CN || host,
            });
          } catch (certErr) {
            socket.destroy();
            resolve({
              hasSSL: true,
              valid: false,
              error: certErr.message,
            });
          }
        },
      );

      socket.on('error', (err) => {
        resolve({
          hasSSL: true,
          valid: false,
          error: err.message,
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          hasSSL: true,
          valid: false,
          error: 'Connection timed out',
        });
      });
    } catch (err) {
      resolve({
        hasSSL: false,
        error: err.message,
      });
    }
  });
}

module.exports = {
  checkSSLCertificate,
};
