function extractPublicId(imageUrl) {
  const regex = /\/v\d+\/(.+)\.\w+$/; // Matches `/v<version>/<public_id>.<extension>`
  const match = imageUrl.match(regex);
  return match ? match[1] : null; // Returns public_id or null if not found
}

module.exports = { extractPublicId };
