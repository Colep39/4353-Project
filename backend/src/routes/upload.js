const express = require("express");
const multer = require("multer");
const supabaseNoAuth = require('../supabaseNoAuth');
const router = express.Router();

// use memory storage to upload directly to Supabase
const upload = multer({ storage: multer.memoryStorage() });

router.post("/profile-photo", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    // create a unique path under the user's folder
    const filePath = `${userId}/${Date.now()}_${file.originalname}`;

    // upload to Supabase storage bucket 'avatars'
    const { data, error } = await supabaseNoAuth.storage
      .from("profile-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    // get the public URL
    const { data: publicData } = supabaseNoAuth.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    // update the user's profilePhoto field
    const { error: updateError } = await supabaseNoAuth
      .from("user_profile")
      .update({ profile_photo: publicUrl })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    res.json({ fileUrl: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
