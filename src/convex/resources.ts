import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
            name: "Flipping Physics",
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

export const seedPhetSimulations = mutation({
    args: {},
    handler: async (ctx) => {
        const phetCategory = await ctx.db
            .query("resources")
            .filter((q) => q.eq(q.field("name"), "Phet Simulations"))
            .unique();

        let phetCategoryId: Id<"resources"> | undefined;

        if (phetCategory) {
            phetCategoryId = phetCategory._id;
            // Get all existing simulations and delete them to avoid duplicates
            const existingSimulations = await ctx.db
                .query("resources")
                .withIndex("by_parent_and_order", (q) => q.eq("parentId", phetCategoryId))
                .collect();
            for (const sim of existingSimulations) {
                await ctx.db.delete(sim._id);
            }
        } else {
            phetCategoryId = await ctx.db.insert("resources", {
                name: "Phet Physics Simulations",
                type: "category",
                parentId: undefined,
                order: 3,
            });
        }

        const simulations = [
            { name: "2D Motion", imageUrl: "https://phet.colorado.edu/sims/html/motion-2d/latest/motion-2d-600.png", url: "https://phet.colorado.edu/en/simulations/motion-2d" },
            { name: "Alpha Decay", imageUrl: "https://phet.colorado.edu/sims/html/alpha-decay/latest/alpha-decay-600.png", url: "https://phet.colorado.edu/en/simulations/alpha-decay" },
            { name: "Atomic Interactions", imageUrl: "https://phet.colorado.edu/sims/html/atomic-interactions/latest/atomic-interactions-600.png", url: "https://phet.colorado.edu/en/simulations/atomic-interactions" },
            { name: "Balancing Act", imageUrl: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act-600.png", url: "https://phet.colorado.edu/en/simulations/balancing-act" },
            { name: "Balloons and Static Electricity", imageUrl: "https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity-600.png", url: "https://phet.colorado.edu/en/simulations/balloons-and-static-electricity" },
            { name: "Bending Light", imageUrl: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light-600.png", url: "https://phet.colorado.edu/en/simulations/bending-light" },
            { name: "Beta Decay", imageUrl: "https://phet.colorado.edu/sims/html/beta-decay/latest/beta-decay-600.png", url: "https://phet.colorado.edu/en/simulations/beta-decay" },
            { name: "Blackbody Spectrum", imageUrl: "https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum-600.png", url: "https://phet.colorado.edu/en/simulations/blackbody-spectrum" },
            { name: "Build a Nucleus", imageUrl: "https://phet.colorado.edu/sims/html/build-a-nucleus/latest/build-a-nucleus-600.png", url: "https://phet.colorado.edu/en/simulations/build-a-nucleus" },
            { name: "Calculus Grapher", imageUrl: "https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher-600.png", url: "https://phet.colorado.edu/en/simulations/calculus-grapher" },
            { name: "Capacitor Lab: Basics", imageUrl: "https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics-600.png", url: "https://phet.colorado.edu/en/simulations/capacitor-lab-basics" },
            { name: "Charges and Fields", imageUrl: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields-600.png", url: "https://phet.colorado.edu/en/simulations/charges-and-fields" },
            { name: "Circuit Construction Kit: AC", imageUrl: "https://phet.colorado.edu/sims/html/circuit-construction-kit-ac/latest/circuit-construction-kit-ac-600.png", url: "https://phet.colorado.edu/en/simulations/circuit-construction-kit-ac" },
            { name: "Circuit Construction Kit: DC", imageUrl: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc-600.png", url: "https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc" },
            { name: "Collision Lab", imageUrl: "https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab-600.png", url: "https://phet.colorado.edu/en/simulations/collision-lab" },
            { name: "Color Vision", imageUrl: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision-600.png", url: "https://phet.colorado.edu/en/simulations/color-vision" },
            { name: "Coulomb's Law", imageUrl: "https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law-600.png", url: "https://phet.colorado.edu/en/simulations/coulombs-law" },
            { name: "Curve Fitting", imageUrl: "https://phet.colorado.edu/sims/html/curve-fitting/latest/curve-fitting-600.png", url: "https://phet.colorado.edu/en/simulations/curve-fitting" },
            { name: "Davisson-Germer: Electron Diffraction", imageUrl: "https://phet.colorado.edu/sims/html/davisson-germer-electron-diffraction/latest/davisson-germer-electron-diffraction-600.png", url: "https://phet.colorado.edu/en/simulations/davisson-germer-electron-diffraction" },
            { name: "Diffusion", imageUrl: "https://phet.colorado.edu/sims/html/diffusion/latest/diffusion-600.png", url: "https://phet.colorado.edu/en/simulations/diffusion" },
            { name: "Energy Forms and Changes", imageUrl: "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes-600.png", url: "https://phet.colorado.edu/en/simulations/energy-forms-and-changes" },
            { name: "Energy Skate Park", imageUrl: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park-600.png", url: "https://phet.colorado.edu/en/simulations/energy-skate-park" },
            { name: "Energy Skate Park: Basics", imageUrl: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics-600.png", url: "https://phet.colorado.edu/en/simulations/energy-skate-park-basics" },
            { name: "Faraday's Electromagnetic Lab", imageUrl: "https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab-600.png", url: "https://phet.colorado.edu/en/simulations/faradays-electromagnetic-lab" },
            { name: "Faraday's Law", imageUrl: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law-600.png", url: "https://phet.colorado.edu/en/simulations/faradays-law" },
            { name: "Fluid Pressure and Flow", imageUrl: "https://phet.colorado.edu/sims/html/fluid-pressure-and-flow/latest/fluid-pressure-and-flow-600.png", url: "https://phet.colorado.edu/en/simulations/fluid-pressure-and-flow" },
            { name: "Forces and Motion: Basics", imageUrl: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics-600.png", url: "https://phet.colorado.edu/en/simulations/forces-and-motion-basics" },
            { name: "Fourier: Making Waves", imageUrl: "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves-600.png", url: "https://phet.colorado.edu/en/simulations/fourier-making-waves" },
            { name: "Friction", imageUrl: "https://phet.colorado.edu/sims/html/friction/latest/friction-600.png", url: "https://phet.colorado.edu/en/simulations/friction" },
            { name: "Gas Properties", imageUrl: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties-600.png", url: "https://phet.colorado.edu/en/simulations/gas-properties" },
            { name: "Geometric Optics", imageUrl: "https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics-600.png", url: "https://phet.colorado.edu/en/simulations/geometric-optics" },
            { name: "Gravity and Orbits", imageUrl: "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits-600.png", url: "https://phet.colorado.edu/en/simulations/gravity-and-orbits" },
            { name: "Gravity Force Lab", imageUrl: "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab-600.png", url: "https://phet.colorado.edu/en/simulations/gravity-force-lab" },
            { name: "Greenhouse Effect", imageUrl: "https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect-600.png", url: "https://phet.colorado.edu/en/simulations/greenhouse-effect" },
            { name: "Hooke's Law", imageUrl: "https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law-600.png", url: "https://phet.colorado.edu/en/simulations/hookes-law" },
            { name: "John Travoltage", imageUrl: "https://phet.colorado.edu/sims/html/john-travoltage/latest/john-travoltage-600.png", url: "https://phet.colorado.edu/en/simulations/john-travoltage" },
            { name: "Ladybug Motion 2D", imageUrl: "https://phet.colorado.edu/sims/html/ladybug-motion-2d/latest/ladybug-motion-2d-600.png", url: "https://phet.colorado.edu/en/simulations/ladybug-motion-2d" },
            { name: "Ladybug Revolution", imageUrl: "https://phet.colorado.edu/sims/html/rotation/latest/rotation-600.png", url: "https://phet.colorado.edu/en/simulations/rotation" },
            { name: "Least-Squares Regression", imageUrl: "https://phet.colorado.edu/sims/html/least-squares-regression/latest/least-squares-regression-600.png", url: "https://phet.colorado.edu/en/simulations/least-squares-regression" },
            { name: "Masses and Springs", imageUrl: "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs-600.png", url: "https://phet.colorado.edu/en/simulations/masses-and-springs" },
            { name: "Masses and Springs: Basics", imageUrl: "https://phet.colorado.edu/sims/html/masses-and-springs-basics/latest/masses-and-springs-basics-600.png", url: "https://phet.colorado.edu/en/simulations/masses-and-springs-basics" },
            { name: "Microwaves", imageUrl: "https://phet.colorado.edu/sims/html/microwaves/latest/microwaves-600.png", url: "https://phet.colorado.edu/en/simulations/microwaves" },
            { name: "Models of the Hydrogen Atom", imageUrl: "https://phet.colorado.edu/sims/html/models-of-the-hydrogen-atom/latest/models-of-the-hydrogen-atom-600.png", url: "https://phet.colorado.edu/en/simulations/models-of-the-hydrogen-atom" },
            { name: "Molecules and Light", imageUrl: "https://phet.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light-600.png", url: "https://phet.colorado.edu/en/simulations/molecules-and-light" },
            { name: "Molecule Shapes", imageUrl: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes-600.png", url: "https://phet.colorado.edu/en/simulations/molecule-shapes" },
            { name: "Molecule Shapes: Basics", imageUrl: "https://phet.colorado.edu/sims/html/molecule-shapes-basics/latest/molecule-shapes-basics-600.png", url: "https://phet.colorado.edu/en/simulations/molecule-shapes-basics" },
            { name: "My Solar System", imageUrl: "https://phet.colorado.edu/sims/html/my-solar-system/latest/my-solar-system-600.png", url: "https://phet.colorado.edu/en/simulations/my-solar-system" },
            { name: "Natural Selection", imageUrl: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png", url: "https://phet.colorado.edu/en/simulations/natural-selection" },
            { name: "Nuclear Fission", imageUrl: "https://phet.colorado.edu/sims/html/nuclear-fission/latest/nuclear-fission-600.png", url: "https://phet.colorado.edu/en/simulations/nuclear-fission" },
            { name: "Ohm's Law", imageUrl: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law-600.png", url: "https://phet.colorado.edu/en/simulations/ohms-law" },
            { name: "Pendulum Lab", imageUrl: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab-600.png", url: "https://phet.colorado.edu/en/simulations/pendulum-lab" },
            { name: "Photoelectric Effect", imageUrl: "https://phet.colorado.edu/sims/html/photoelectric-effect/latest/photoelectric-effect-600.png", url: "https://phet.colorado.edu/en/simulations/photoelectric-effect" },
            { name: "Projectile Motion", imageUrl: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion-600.png", url: "https://phet.colorado.edu/en/simulations/projectile-motion" },
            { name: "Quantum Bound States", imageUrl: "https://phet.colorado.edu/sims/html/bound-states/latest/bound-states-600.png", url: "https://phet.colorado.edu/en/simulations/bound-states" },
            { name: "Quantum Tunneling and Wave Packets", imageUrl: "https://phet.colorado.edu/sims/html/quantum-tunneling/latest/quantum-tunneling-600.png", url: "https://phet.colorado.edu/en/simulations/quantum-tunneling" },
            { name: "Quantum Wave Interference", imageUrl: "https://phet.colorado.edu/sims/html/quantum-wave-interference/latest/quantum-wave-interference-600.png", url: "https://phet.colorado.edu/en/simulations/quantum-wave-interference" },
            { name: "Radioactive Dating Game", imageUrl: "https://phet.colorado.edu/sims/html/radioactive-dating-game/latest/radioactive-dating-game-600.png", url: "https://phet.colorado.edu/en/simulations/radioactive-dating-game" },
            { name: "Radiating Charge", imageUrl: "https://phet.colorado.edu/sims/html/radiating-charge/latest/radiating-charge-600.png", url: "https://phet.colorado.edu/en/simulations/radiating-charge" },
            { name: "Radio Waves & Electromagnetic Fields", imageUrl: "https://phet.colorado.edu/sims/html/radio-waves/latest/radio-waves-600.png", url: "https://phet.colorado.edu/en/simulations/radio-waves" },
            { name: "Ramp: Forces and Motion", imageUrl: "https://phet.colorado.edu/sims/html/ramp-forces-and-motion/latest/ramp-forces-and-motion-600.png", url: "https://phet.colorado.edu/en/simulations/ramp-forces-and-motion" },
            { name: "Resistance in a Wire", imageUrl: "https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire-600.png", url: "https://phet.colorado.edu/en/simulations/resistance-in-a-wire" },
            { name: "Resonance", imageUrl: "https://phet.colorado.edu/sims/html/resonance/latest/resonance-600.png", url: "https://phet.colorado.edu/en/simulations/resonance" },
            { name: "Reversible Reactions", imageUrl: "https://phet.colorado.edu/sims/html/reversible-reactions/latest/reversible-reactions-600.png", url: "https://phet.colorado.edu/en/simulations/reversible-reactions" },
            { name: "Rutherford Scattering", imageUrl: "https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering-600.png", url: "https://phet.colorado.edu/en/simulations/rutherford-scattering" },
            { name: "Semiconductors", imageUrl: "https://phet.colorado.edu/sims/html/semiconductors/latest/semiconductors-600.png", url: "https://phet.colorado.edu/en/simulations/semiconductors" },
            { name: "Sound", imageUrl: "https://phet.colorado.edu/sims/html/sound/latest/sound-600.png", url: "https://phet.colorado.edu/en/simulations/sound" },
            { name: "States of Matter", imageUrl: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter-600.png", url: "https://phet.colorado.edu/en/simulations/states-of-matter" },
            { name: "States of Matter: Basics", imageUrl: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics-600.png", url: "https://phet.colorado.edu/en/simulations/states-of-matter-basics" },
            { name: "Stern-Gerlach Experiment", imageUrl: "https://phet.colorado.edu/sims/html/stern-gerlach/latest/stern-gerlach-600.png", url: "https://phet.colorado.edu/en/simulations/stern-gerlach" },
            { name: "The Moving Man", imageUrl: "https://phet.colorado.edu/sims/html/moving-man/latest/moving-man-600.png", url: "https://phet.colorado.edu/en/simulations/moving-man" },
            { name: "Torque", imageUrl: "https://phet.colorado.edu/sims/html/torque/latest/torque-600.png", url: "https://phet.colorado.edu/en/simulations/torque" },
            { name: "Trig Tour", imageUrl: "https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour-600.png", url: "https://phet.colorado.edu/en/simulations/trig-tour" },
            { name: "Under Pressure", imageUrl: "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure-600.png", url: "https://phet.colorado.edu/en/simulations/under-pressure" },
            { name: "Vector Addition", imageUrl: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition-600.png", url: "https://phet.colorado.edu/en/simulations/vector-addition" },
            { name: "Wave on a String", imageUrl: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string-600.png", url: "https://phet.colorado.edu/en/simulations/wave-on-a-string" },
            { name: "Wave Interference", imageUrl: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference-600.png", url: "https://phet.colorado.edu/en/simulations/wave-interference" },
            { name: "Waves Intro", imageUrl: "https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro-600.png", url: "https://phet.colorado.edu/en/simulations/waves-intro" },
        ];

        for (let i = 0; i < simulations.length; i++) {
            await ctx.db.insert("resources", {
                name: simulations[i].name,
                type: "simulation",
                url: simulations[i].url,
                imageUrl: simulations[i].imageUrl,
                parentId: phetCategoryId,
                order: i + 1,
            });
        }

        return "Phet simulations seeded successfully!";
    }
});