function getEmailService(email) {
    const domain = email.split('@')[1];
    const emailServiceMap = {
      'gmail.com': 'gmail',
      'yahoo.com': 'yahoo',
      'hotmail.com': 'hotmail',
      'outlook.com': 'hotmail',
      'icloud.com': 'icloud',
      'aol.com': 'aol',
      'yandex.com': 'yandex',
      'protonmail.com': 'protonmail',
      'mail.ru': 'mail.ru',
      'zoho.com': 'zoho',
    };
    return emailServiceMap[domain] || null;
  }
  
  module.exports = getEmailService;