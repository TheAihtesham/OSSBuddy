import { Bookmark } from "../model/bookmark";
import { authMiddleware } from "../middleware/auth";
import router from "../route/auth";

const GITHUB_API_BASE = "https://api.github.com";

const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

router.post("/bookmarks", authMiddleware, async (req: any, res: any) => {
  const { repoURL, name, description, language, forks, stargazers_count } = req.body;

  const exists = await Bookmark.findOne({
    githubID: req.user.id,
    repoURL,
  });

  if (exists) return res.json({ message: "Already bookmarked" });

  const bookmark = await Bookmark.create({
    githubID: req.user.id,
    repoURL,
    name,
    description,
    language,
    forks,
    stargazers_count,
  });

  res.status(201).json(bookmark);
});

router.get("/get-bookmarks", authMiddleware, async (req: any, res) => {
  const bookmarks = await Bookmark.find({ githubID: req.user.id });
  res.json({ bookmarks });
});

router.delete("/delete-bookmark/:bookmarkId", authMiddleware, async(req: any, res: any) => {
  try {
    const { bookmarkId } = req.params;

    const deletedBookmark = await Bookmark.findOneAndDelete({
      _id: bookmarkId,
      githubID: req.user.id, 
    });

    if (!deletedBookmark) {
      return res.status(404).json({
        message: "Bookmark not found or not authorized",
      });
    }

    res.json({
      message: "Bookmark deleted successfully",
      bookmark: deletedBookmark,
    });
  } catch (error) {
    console.error("DELETE BOOKMARK ERROR:", error);
    res.status(500).json({ message: "Failed to delete bookmark" });
  }
}
);

export default router