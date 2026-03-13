import Banner from "../models/Banner";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";

export default function (appRouter: Router) {
    // @desc    Get active banners
    // @route   GET /api/v1/public/banners
    // @access  Public
    appRouter.get("/api/v1/public/banners", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const banners = await Banner.find({ status: 'ACTIVE' })
                .sort({ displayOrder: 1, createdAt: -1 });

            const mapped = banners.map(b => ({
                id: b._id,
                title: b.title,
                description: b.description,
                imageUrl: b.imageUrl,
                linkUrl: b.linkUrl,
                displayOrder: b.displayOrder,
                status: b.status
            }));

            appRouter.sendResponse(res, 200, { message: "Active banners retrieved successfully", data: mapped });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });
}
