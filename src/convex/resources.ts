import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const seedKhanAcademy = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("resources")
      .withIndex("by_source", (q) => q.eq("source", "Khan Academy"))
      .collect();

    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    const links = [
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:scalars-and-vectors-in-1d/e/scalars-and-vectors",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:visual-models-of-motion/e/visual-representations-of-motion",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:visual-models-of-motion/e/v-t-area-displacement",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:visual-models-of-motion/e/acceleration-exercises-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:visual-models-of-motion/quiz/xf557a762645cccc5:kinematics-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:mathematical-models-of-motion/e/linearization-and-proportional-reasoning",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:mathematical-models-of-motion/e/position-acceleration-and-velocity",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:mathematical-models-of-motion/e/representations-of-motion",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:mathematical-models-of-motion/e/freefall-exercise-ap1-graphs-and-concepts",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:mathematical-models-of-motion/e/freefall-exercises-ap1-numerical",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/e/analyzing-vectors-in-2d-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/e/2d-projectile-motion-concepts-quiz",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/e/angled-launch-projectile-vectors-exercise",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/e/graphs-for-2d-projectiles",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/e/2d-projectile-motion-with-components-given-exercise",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/quiz/xf557a762645cccc5:kinematics-quiz-2",
      "/science/ap-college-physics-1/xf557a762645cccc5:kinematics/xf557a762645cccc5:motion-in-2d/test/xf557a762645cccc5:kinematics-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-systems/e/free-body-diagrams-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-systems/e/newton-3rd-law-free-body-diagram",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-acceleration/e/newton-s-second-law",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-acceleration/e/newton-s-2nd-and-3rd-laws",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-acceleration/e/inclined-planes-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-acceleration/e/applications-of-newtons-second-law",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:forces-and-acceleration/quiz/xf557a762645cccc5:force-and-translational-dynamics-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:gravitational-force/e/gravitational-forces",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:gravitational-force/e/the-gravitational-field",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:gravitational-force/e/newton-s-first-law",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:friction-force/e/friction-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:friction-force/quiz/xf557a762645cccc5:force-and-translational-dynamics-quiz-2",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:spring-force/e/hooke-s-law-and-spring-force-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:circular-motion/e/free-body-diagrams-for-uniform-circular-motion",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:circular-motion/e/centripetal-acceleration-and-centripetal-force",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:circular-motion/e/applications-of-circular-motion-and-gravitation",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:circular-motion/quiz/xf557a762645cccc5:force-and-translational-dynamics-quiz-3",
      "/science/ap-college-physics-1/xf557a762645cccc5:force-and-translational-dynamics/xf557a762645cccc5:circular-motion/test/xf557a762645cccc5:force-and-translational-dynamics-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:translational-kinetic-energy-and-work/e/work-and-mechanical-energy",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:translational-kinetic-energy-and-work/e/work-graphs-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:potential-energy/e/gravitational-potential-energy-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:potential-energy/quiz/xf557a762645cccc5:work-energy-and-power-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:untitled-271/e/conservation-of-energy-law-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:untitled-271/e/conservation-of-energy",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:power/e/power-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:power/quiz/xf557a762645cccc5:work-energy-and-power-quiz-2",
      "/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power/xf557a762645cccc5:power/test/xf557a762645cccc5:work-energy-and-power-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:linear-momentum-and-impulse/e/momentum-and-impulse",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:linear-momentum-and-impulse/e/representation-of-changes-in-momentum",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:untitled-303/e/conservation-of-linear-momentum",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:untitled-303/e/conservation-of-momentum-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:untitled-303/quiz/xf557a762645cccc5:linear-momentum-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:elastic-and-inelastic-collisions/e/inelastic-collisions-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:center-of-mass/e/center-of-mass-exercises-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:center-of-mass/quiz/xf557a762645cccc5:linear-momentum-quiz-2",
      "/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum/xf557a762645cccc5:center-of-mass/test/xf557a762645cccc5:linear-momentum-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:untitled-320/e/ram-cram",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:untitled-320/e/rotational-kinematics",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:torque/e/torque-calculations-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:torque/e/torque-equilibrium-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:torque/quiz/xf557a762645cccc5:torque-and-rotational-dynamics-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:newton-s-second-law-in-rotational-form/e/multiple-torques-and-rotation",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:newton-s-second-law-in-rotational-form/e/conceptual-angular-second-law-exercises-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:newton-s-second-law-in-rotational-form/quiz/xf557a762645cccc5:torque-and-rotational-dynamics-quiz-2",
      "/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics/xf557a762645cccc5:newton-s-second-law-in-rotational-form/test/xf557a762645cccc5:torque-and-rotational-dynamics-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:energy-and-momentum-of-rotating-systems/xf557a762645cccc5:rotational-kinetic-energy/e/rotational-kinetic-energy-exercises-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:energy-and-momentum-of-rotating-systems/xf557a762645cccc5:angular-momentum/e/angular-momentum-calculations-ap-physics-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:energy-and-momentum-of-rotating-systems/xf557a762645cccc5:conservation-of-angular-momentum/e/angular-momentum-torque",
      "/science/ap-college-physics-1/xf557a762645cccc5:energy-and-momentum-of-rotating-systems/xf557a762645cccc5:conservation-of-angular-momentum/e/conservation-of-angular-momentum-2",
      "/science/ap-college-physics-1/xf557a762645cccc5:energy-and-momentum-of-rotating-systems/xf557a762645cccc5:conservation-of-angular-momentum/quiz/xf557a762645cccc5:energy-and-momentum-of-rotating-systems-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:energy-and-momentum-of-rotating-systems/xf557a762645cccc5:conservation-of-angular-momentum/test/xf557a762645cccc5:energy-and-momentum-of-rotating-systems-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:oscillations/xf557a762645cccc5:simple-harmonic-oscillators/e/finding-frequency-and-period-from-shm-graph-ap1",
      "/science/ap-college-physics-1/xf557a762645cccc5:oscillations/xf557a762645cccc5:period-of-simple-harmonic-oscillators/e/period-simple-harmonic-oscillators",
      "/science/ap-college-physics-1/xf557a762645cccc5:oscillations/xf557a762645cccc5:energy-of-simple-harmonic-oscillator/e/energy-simple-harmonic-oscillator",
      "/science/ap-college-physics-1/xf557a762645cccc5:oscillations/xf557a762645cccc5:energy-of-simple-harmonic-oscillator/quiz/xf557a762645cccc5:oscillations-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:oscillations/xf557a762645cccc5:energy-of-simple-harmonic-oscillator/test/xf557a762645cccc5:oscillations-unit-test",
      "/science/ap-college-physics-1/xf557a762645cccc5:fluids/xf557a762645cccc5:untitled-354/e/density-and-pressure",
      "/science/ap-college-physics-1/xf557a762645cccc5:fluids/xf557a762645cccc5:buoyant-force/e/the-buoyant-force",
      "/science/ap-college-physics-1/xf557a762645cccc5:fluids/xf557a762645cccc5:fluid-flow/e/flow",
      "/science/ap-college-physics-1/xf557a762645cccc5:fluids/xf557a762645cccc5:fluid-flow/quiz/xf557a762645cccc5:fluids-quiz-1",
      "/science/ap-college-physics-1/xf557a762645cccc5:fluids/xf557a762645cccc5:fluid-flow/test/xf557a762645cccc5:fluids-unit-test",
    ];

    const processedLinks = links.map((link) => {
      const parts = link.split("/");
      let type = "exercise";
      if (parts.includes("quiz")) {
        type = "quiz";
      } else if (parts.includes("test")) {
        type = "test";
      }

      let name = "";
      const lastPart = parts[parts.length - 1];
      if (parts.includes("e")) {
        name = lastPart;
      } else {
        name = lastPart.split(":").pop() ?? lastPart;
      }

      name = name.replace(/-/g, " ").replace(/ap1/g, "AP1").replace(/2d/g, "2D");
      name = name.charAt(0).toUpperCase() + name.slice(1);

      let topic = "AP Physics 1";
      for (const part of parts) {
        if (part.startsWith("xf") && part.includes(":")) {
          topic = part
            .split(":")[1]
            .replace(/-/g, " ")
            .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
          break;
        }
      }

      return {
        name: name,
        url: `https://www.khanacademy.org${link}`,
        type: type,
        topic: topic,
        source: "Khan Academy",
      };
    });

    for (const resource of processedLinks) {
      await ctx.db.insert("resources", resource as any);
    }
  },
});

export const seedMoreResources = mutation({
  handler: async (ctx) => {
    // Placeholder for additional resources
    console.log("More resources seeded");
  },
});

export const seedPhetSimulations = mutation({
  handler: async (ctx) => {
    // Placeholder for PhET simulations
    console.log("PhET simulations seeded");
  },
});

export const getResources = query({
  args: { 
    parentId: v.optional(v.id("resources")),
    search: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (args.search) {
      return await ctx.db
        .query("resources")
        .filter((q) => q.or(
          q.eq(q.field("name"), args.search),
          q.eq(q.field("topic"), args.search)
        ))
        .collect();
    }
    
    return await ctx.db.query("resources").collect();
  },
});

export const get = query({
  args: { id: v.id("resources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const searchResources = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("resources").collect();
  },
});