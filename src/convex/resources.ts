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

export const seedMoreResources = mutation({
    args: {},
    handler: async (ctx) => {
        const mainCategoryId = await ctx.db.insert("resources", {
            name: "Comprehensive AP Physics C Resources",
            type: "category",
            parentId: undefined,
            order: 2,
        });

        const mechanicsId = await ctx.db.insert("resources", {
            name: "Mechanics",
            type: "category",
            parentId: mainCategoryId,
            order: 1,
        });

        const emId = await ctx.db.insert("resources", {
            name: "Electricity & Magnetism",
            type: "category",
            parentId: mainCategoryId,
            order: 2,
        });

        const mechanicsTopics = [
            {
                name: "Kinematics",
                videos: [{ name: "AP Physics C: Mechanics - Kinematics Review", url: "https://www.youtube.com/watch?v=2C5kkB4g64E" }],
                notes: [{ name: "Kinematics Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/01_-_kinematics_lecture_notes.pdf" }],
                problems: [
                    { name: "OpenStax - Ch 3: Motion Along a Straight Line", url: "https://openstax.org/books/university-physics-volume-1/pages/3-problems" },
                    { name: "OpenStax - Ch 4: Motion in Two and Three Dimensions", url: "https://openstax.org/books/university-physics-volume-1/pages/4-problems" },
                ]
            },
            {
                name: "Dynamics (Newton's Laws)",
                videos: [{ name: "AP Physics C: Mechanics - Dynamics Review", url: "https://www.youtube.com/watch?v=Qf_t2y_j-sE" }],
                notes: [{ name: "Dynamics Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/02_-_dynamics_lecture_notes.pdf" }],
                problems: [
                    { name: "OpenStax - Ch 5: Newton's Laws of Motion", url: "https://openstax.org/books/university-physics-volume-1/pages/5-problems" },
                    { name: "OpenStax - Ch 6: Applications of Newton's Laws", url: "https://openstax.org/books/university-physics-volume-1/pages/6-problems" },
                ]
            },
            {
                name: "Work, Energy, and Power",
                videos: [{ name: "AP Physics C: Mechanics - Work and Energy Review", url: "https://www.youtube.com/watch?v=Ns5s_q_I-vE" }],
                notes: [{ name: "Work, Energy, and Power Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/03_-_work_energy_and_power_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 7: Work and Kinetic Energy", url: "https://openstax.org/books/university-physics-volume-1/pages/7-problems" }]
            },
            {
                name: "Momentum",
                videos: [{ name: "AP Physics C: Mechanics - Momentum Review", url: "https://www.youtube.com/watch?v=z3Xp_i-sO3U" }],
                notes: [{ name: "Momentum Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/04_-_momentum_lecture_notes.pdf" }],
                problems: [
                    { name: "OpenStax - Ch 8: Potential Energy and Conservation of Energy", url: "https://openstax.org/books/university-physics-volume-1/pages/8-problems" },
                    { name: "OpenStax - Ch 9: Linear Momentum and Collisions", url: "https://openstax.org/books/university-physics-volume-1/pages/9-problems" },
                ]
            },
            {
                name: "Rotational Motion",
                videos: [{ name: "AP Physics C: Mechanics - Rotational Motion Review", url: "https://www.youtube.com/watch?v=wY-B22Qyq14" }],
                notes: [{ name: "Rotational Motion Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/05_-_rotational_motion_lecture_notes.pdf" }],
                problems: [
                    { name: "OpenStax - Ch 10: Fixed-Axis Rotation", url: "https://openstax.org/books/university-physics-volume-1/pages/10-problems" },
                    { name: "OpenStax - Ch 11: Angular Momentum", url: "https://openstax.org/books/university-physics-volume-1/pages/11-problems" },
                ]
            },
            {
                name: "Gravitation",
                videos: [{ name: "AP Physics C: Mechanics - Gravitation Review", url: "https://www.youtube.com/watch?v=3z2_F41Gk_s" }],
                notes: [{ name: "Gravitation Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/07_-_gravitation_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 13: Gravitation", url: "https://openstax.org/books/university-physics-volume-1/pages/13-problems" }]
            },
            {
                name: "Simple Harmonic Motion",
                videos: [{ name: "AP Physics C: Mechanics - Simple Harmonic Motion Review", url: "https://www.youtube.com/watch?v=rZIZj_3a-cM" }],
                notes: [{ name: "Simple Harmonic Motion Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/06_-_simple_harmonic_motion_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 15: Oscillations", url: "https://openstax.org/books/university-physics-volume-1/pages/15-problems" }]
            },
            {
                name: "AP Physics C: Mechanics Exam Review",
                videos: [
                    { name: "Entire AP Physics C: Mechanics Course in 2.5 Hours", url: "https://www.youtube.com/watch?v=sCo_r8I-H8E" },
                    { name: "AP Physics C: Mechanics - 2023 Exam FRQ Review", url: "https://www.youtube.com/watch?v=1bNPaH4s3Hw" },
                ]
            }
        ];

        for (let i = 0; i < mechanicsTopics.length; i++) {
            const topic = mechanicsTopics[i];
            const topicId = await ctx.db.insert("resources", {
                name: topic.name,
                type: "category",
                parentId: mechanicsId,
                order: i + 1,
            });

            if (topic.videos && topic.videos.length > 0) {
                const videosId = await ctx.db.insert("resources", { name: "Review Videos", type: "category", parentId: topicId, order: 1 });
                for (let j = 0; j < topic.videos.length; j++) {
                    await ctx.db.insert("resources", { ...topic.videos[j], type: "video", parentId: videosId, order: j + 1 });
                }
            }

            if (topic.notes && topic.notes.length > 0) {
                const notesId = await ctx.db.insert("resources", { name: "Lecture Notes", type: "category", parentId: topicId, order: 2 });
                for (let j = 0; j < topic.notes.length; j++) {
                    await ctx.db.insert("resources", { ...topic.notes[j], type: "guidesheet", parentId: notesId, order: j + 1 });
                }
            }

            if (topic.problems && topic.problems.length > 0) {
                const problemsId = await ctx.db.insert("resources", { name: "Problem Sets", type: "category", parentId: topicId, order: 3 });
                for (let j = 0; j < topic.problems.length; j++) {
                    await ctx.db.insert("resources", { ...topic.problems[j], type: "link", parentId: problemsId, order: j + 1 });
                }
            }
        }

        const emTopics = [
            {
                name: "Electric Charges and Fields",
                videos: [{ name: "AP Physics C: E&M - Electric Charge and Field Review", url: "https://www.youtube.com/watch?v=1z3Ky1s_21E" }],
                notes: [{ name: "Electric Charges and Fields Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/08_-_electric_charges_and_fields_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 5: Electric Charges and Fields", url: "https://openstax.org/books/university-physics-volume-2/pages/5-problems" }],
                edpuzzles: [
                    { name: "Electric Charge", url: "https://edpuzzle.com/media/5a749e3c06391f411e42498b" },
                    { name: "Electric Field", url: "https://edpuzzle.com/media/5a7b8868c32b18410e68b6b7" },
                    { name: "Gauss's Law", url: "https://edpuzzle.com/media/5a82097f893733412e4b358a" },
                ]
            },
            {
                name: "Electric Potential",
                videos: [{ name: "AP Physics C: E&M - Electric Potential Review", url: "https://www.youtube.com/watch?v=s2-y_z_1aM4" }],
                notes: [{ name: "Electric Potential Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/09_-_electric_potential_lecture_notes.pdf" }],
                problems: [
                    { name: "OpenStax - Ch 6: Gauss's Law", url: "https://openstax.org/books/university-physics-volume-2/pages/6-problems" },
                    { name: "OpenStax - Ch 7: Electric Potential", url: "https://openstax.org/books/university-physics-volume-2/pages/7-problems" },
                ],
                edpuzzles: [{ name: "Electric Potential", url: "https://edpuzzle.com/media/5a8f336c893733412e4b8d32" }]
            },
            {
                name: "Conductors and Capacitors",
                videos: [{ name: "AP Physics C: E&M - Capacitance Review", url: "https://www.youtube.com/watch?v=u-g_G0_c5oA" }],
                notes: [{ name: "Conductors and Capacitors Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/10_-_conductors_and_capacitors_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 8: Capacitance", url: "https://openstax.org/books/university-physics-volume-2/pages/8-problems" }],
                edpuzzles: [{ name: "Capacitance", url: "https://edpuzzle.com/media/5a970851b5428c41053d33a6" }]
            },
            {
                name: "Circuits",
                videos: [{ name: "AP Physics C: E&M - Circuits Review", url: "https://www.youtube.com/watch?v=rY4MAn_z_3c" }],
                notes: [{ name: "Circuits Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/11_-_circuits_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 10: Direct-Current Circuits", url: "https://openstax.org/books/university-physics-volume-2/pages/10-problems" }],
                edpuzzles: [{ name: "DC Circuits", url: "https://edpuzzle.com/media/5aa1a830da35634108a04227" }]
            },
            {
                name: "Magnetic Fields",
                videos: [{ name: "AP Physics C: E&M - Magnetic Fields Review", url: "https://www.youtube.com/watch?v=B8plQ06C_sE" }],
                notes: [{ name: "Magnetic Fields Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/12_-_magnetic_fields_lecture_notes.pdf" }],
                problems: [
                    { name: "OpenStax - Ch 11: Magnetic Forces and Fields", url: "https://openstax.org/books/university-physics-volume-2/pages/11-problems" },
                    { name: "OpenStax - Ch 12: Sources of Magnetic Fields", url: "https://openstax.org/books/university-physics-volume-2/pages/12-problems" },
                ],
                edpuzzles: [{ name: "Magnetic Fields", url: "https://edpuzzle.com/media/5ab428f5b4356b40f6a2c534" }]
            },
            {
                name: "Induction",
                videos: [{ name: "AP Physics C: E&M - Induction Review", url: "https://www.youtube.com/watch?v=G9VbfiS_p1Y" }],
                notes: [{ name: "Induction Lecture Notes", url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/13_-_induction_lecture_notes.pdf" }],
                problems: [{ name: "OpenStax - Ch 13: Electromagnetic Induction", url: "https://openstax.org/books/university-physics-volume-2/pages/13-problems" }],
                edpuzzles: [{ name: "Inductance", url: "https://edpuzzle.com/media/5ac2991935a2934119e1ea8a" }]
            },
            {
                name: "AP Physics C: E&M Exam Review",
                videos: [
                    { name: "Entire AP Physics C: E&M Course in 2 Hours", url: "https://www.youtube.com/watch?v=C5_3y_1K-ck" },
                    { name: "AP Physics C: E&M - 2023 Exam FRQ Review", url: "https://www.youtube.com/watch?v=r-2Yd_i4Gz0" },
                ]
            }
        ];

        for (let i = 0; i < emTopics.length; i++) {
            const topic = emTopics[i];
            const topicId = await ctx.db.insert("resources", {
                name: topic.name,
                type: "category",
                parentId: emId,
                order: i + 1,
            });

            if (topic.videos && topic.videos.length > 0) {
                const videosId = await ctx.db.insert("resources", { name: "Review Videos", type: "category", parentId: topicId, order: 1 });
                for (let j = 0; j < topic.videos.length; j++) {
                    await ctx.db.insert("resources", { ...topic.videos[j], type: "video", parentId: videosId, order: j + 1 });
                }
            }

            if (topic.notes && topic.notes.length > 0) {
                const notesId = await ctx.db.insert("resources", { name: "Lecture Notes", type: "category", parentId: topicId, order: 2 });
                for (let j = 0; j < topic.notes.length; j++) {
                    await ctx.db.insert("resources", { ...topic.notes[j], type: "guidesheet", parentId: notesId, order: j + 1 });
                }
            }

            if (topic.problems && topic.problems.length > 0) {
                const problemsId = await ctx.db.insert("resources", { name: "Problem Sets", type: "category", parentId: topicId, order: 3 });
                for (let j = 0; j < topic.problems.length; j++) {
                    await ctx.db.insert("resources", { ...topic.problems[j], type: "link", parentId: problemsId, order: j + 1 });
                }
            }

            if (topic.edpuzzles && topic.edpuzzles.length > 0) {
                const edpuzzlesId = await ctx.db.insert("resources", { name: "Edpuzzle Videos", type: "category", parentId: topicId, order: 4 });
                for (let j = 0; j < topic.edpuzzles.length; j++) {
                    await ctx.db.insert("resources", { ...topic.edpuzzles[j], type: "video", parentId: edpuzzlesId, order: j + 1 });
                }
            }
        }

        return "More resources seeded successfully!";
    }
});