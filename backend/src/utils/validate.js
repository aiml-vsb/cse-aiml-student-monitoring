const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (result.success) {
    next();
  } else {
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "field"}: ${issue.message}`
    );
    return res.status(400).json({
      success: false,
      message: messages.join("; "),
      data: null,
    });
  }
};

module.exports = validate;