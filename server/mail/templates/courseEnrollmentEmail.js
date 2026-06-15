exports.courseEnrollmentEmail = (userName, courseName) => {
  return {
    subject: `Enrolled in ${courseName}`,
    text: `Hi ${userName},\n\nYou have been enrolled in ${courseName}.`,
    html: `<p>Hi ${userName},</p><p>You have been enrolled in <strong>${courseName}</strong>.</p>`,
  };
};
