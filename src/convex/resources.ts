import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: { id: v.id("resources") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getResources = query({
    args: {
        parentId: v.optional(v.id("resources")),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.search) {
            return await ctx.db
                .query("resources")
                .withSearchIndex("by_name", (q) => q.search("name", args.search!))
                .collect();
        }

        return await ctx.db
            .query("resources")
            .withIndex("by_parent_and_order", (q) => q.eq("parentId", args.parentId))
            .collect();
    },
});

export const seedAPlusPhysics = mutation({
    args: {},
    handler: async (ctx) => {
        // Create main category
        const aplusId = await ctx.db.insert("resources", {
            name: "AP Plus Physics",
            type: "category",
            parentId: undefined,
            order: 1,
        });

        // Mechanics category
        const mechanicsId = await ctx.db.insert("resources", {
            name: "Mechanics",
            type: "category", 
            parentId: aplusId,
            order: 1,
        });

        // Mechanics guide sheets
        const mechanicsGuides = [
            { name: "1D Motion", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-1D%20Motion.pdf" },
            { name: "2D Motion", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-2D%20Motion.pdf" },
            { name: "Dynamics", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Dynamics.pdf" },
            { name: "Work, Energy, and Power", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-WEP.pdf" },
            { name: "Impulse and Momentum", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Momentum.pdf" },
            { name: "Rotation", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Rotation.pdf" },
            { name: "Angular Momentum", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-AngularMomentum.pdf" },
            { name: "Oscillations", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Oscillations.pdf" },
            { name: "Gravity", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Gravity.pdf" },
        ];

        for (let i = 0; i < mechanicsGuides.length; i++) {
            await ctx.db.insert("resources", {
                name: mechanicsGuides[i].name,
                type: "guidesheet",
                url: mechanicsGuides[i].url,
                parentId: mechanicsId,
                order: i + 1,
            });
        }

        // E&M category
        const emId = await ctx.db.insert("resources", {
            name: "Electricity & Magnetism",
            type: "category",
            parentId: aplusId,
            order: 2,
        });

        // E&M guide sheets
        const emGuides = [
            { name: "Electric Field and Force", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-EField.pdf" },
            { name: "Electric Potential", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-EPotential.pdf" },
            { name: "Electric Circuits", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Circuits.pdf" },
            { name: "Magnetism", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Magnetism.pdf" },
            { name: "Electromagnetism", url: "https://aplusphysics.com/courses/ap-c/tutorials/APC-Electromagnetism.pdf" },
        ];

        for (let i = 0; i < emGuides.length; i++) {
            await ctx.db.insert("resources", {
                name: emGuides[i].name,
                type: "guidesheet",
                url: emGuides[i].url,
                parentId: emId,
                order: i + 1,
            });
        }

        // Videos category
        const videosId = await ctx.db.insert("resources", {
            name: "Video Tutorials",
            type: "category",
            parentId: aplusId,
            order: 3,
        });

        // Sample video resources (key topics)
        const videoResources = [
            { name: "Dot Product (Scalar Product)", url: "https://aplusphysics.com/courses/ap-c/videos/DotProduct/DotProduct.html" },
            { name: "Cross Product (Vector Product)", url: "https://aplusphysics.com/courses/ap-c/videos/CrossProduct/CrossProduct.html" },
            { name: "Newton's 2nd Law of Motion", url: "https://aplusphysics.com/courses/ap-c/videos/N2Law/N2Law.html" },
            { name: "Conservation of Energy", url: "https://aplusphysics.com/courses/ap-c/videos/ConservationEnergy/ConsE.html" },
            { name: "Rotational Dynamics", url: "https://aplusphysics.com/courses/ap-c/videos/APC-RotationalDynamics/RotDyn.html" },
            { name: "Simple Harmonic Motion", url: "https://aplusphysics.com/courses/ap-c/videos/APC-SHM/APC-SHM.html" },
            { name: "Gauss's Law", url: "https://aplusphysics.com/courses/ap-c/videos/APC-Gauss/APC-Gauss.html" },
            { name: "Faraday's Law and Lenz's Law", url: "https://aplusphysics.com/courses/ap-c/videos/APC-Faraday/APC-Faraday.html" },
        ];

        for (let i = 0; i < videoResources.length; i++) {
            await ctx.db.insert("resources", {
                name: videoResources[i].name,
                type: "video",
                url: videoResources[i].url,
                parentId: videosId,
                order: i + 1,
            });
        }

        return "AP Plus Physics resources seeded successfully!";
    },
});