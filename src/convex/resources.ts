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

    const apPhysics1Links = [
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

    const apPhysics2Links = [
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:gases/e/calculations-using-the-ideal-gas-equation-exercise",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:gases/e/kinetic-molecular-theory",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:gases/e/rms-speed-and-average-kinetic-energy-of-gas-molecules",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:gases/quiz/x0e2f5a2c:thermodynamics-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermal-energy-and-thermal-equilibrium/e/understand-thermal-energy-and-equilibrium",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermal-energy-and-thermal-equilibrium/e/apply-thermal-energy-and-equilibrium",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermal-energy-and-thermal-equilibrium/e/understand-thermodynamics",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermal-energy-and-thermal-equilibrium/e/apply-thermodynamics",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermal-energy-and-thermal-equilibrium/e/apply-specific-heat-capacity",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermal-energy-and-thermal-equilibrium/quiz/x0e2f5a2c:thermodynamics-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermodynamic-processes/e/first-law-of-thermodynamics-word-problems",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermodynamic-processes/e/thermodynamic-processes",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermodynamic-processes/quiz/x0e2f5a2c:thermodynamics-quiz-3",
      "/science/ap-physics-2/x0e2f5a2c:thermodynamics/x0e2f5a2c:thermodynamic-processes/test/x0e2f5a2c:thermodynamics-unit-test",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-charge-and-electric-force/e/conservation-of-charge-quantitative-ap-physics-1",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-charge-and-electric-force/e/charge-transfer-ap-physics-1",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-charge-and-electric-force/e/electric-force",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-charge-and-electric-force/quiz/x0e2f5a2c:electric-force-field-and-potential-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-fields/e/force-in-electric-field",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-fields/e/electric-field-due-to-point-charge",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-fields/e/net-electric-field-due-to-multiple-charges-1d",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-fields/e/superposition-principle",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/x0e2f5a2c:electric-fields/quiz/x0e2f5a2c:electric-force-field-and-potential-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/electric-potential-energy-electric-potential-and-voltage/e/electric-potential-definition",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/electric-potential-energy-electric-potential-and-voltage/e/electric-potential-conceptual-problems-part-1",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/electric-potential-energy-electric-potential-and-voltage/e/potential-due-to-a-system-of-charges",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/electric-potential-energy-electric-potential-and-voltage/quiz/x0e2f5a2c:electric-force-field-and-potential-quiz-3",
      "/science/ap-physics-2/x0e2f5a2c:electric-force-field-and-potential/electric-potential-energy-electric-potential-and-voltage/test/x0e2f5a2c:electric-force-field-and-potential-unit-test",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:current-resistivity-ohms-law/e/voltage-and-ohm-s-law-ap1",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:current-resistivity-ohms-law/e/simple-circuits-numerical-ap1",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:current-resistivity-ohms-law/quiz/x0e2f5a2c:electric-circuits-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:compound-circuits/e/finding-equivalent-resistance",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:compound-circuits/e/simplifying-resistor-networks",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:compound-circuits/e/finding-currents-and-voltages--pure-circuits-",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:compound-circuits/quiz/x0e2f5a2c:electric-circuits-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:electric-circuits/x0e2f5a2c:circuits-with-capacitors/test/x0e2f5a2c:electric-circuits-unit-test",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetic-fields/e/magnetic-field-lines--properties",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetism-and-moving-charges/e/direction-of-cross-product-of-two-vectors-right-hand-rule",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetism-and-moving-charges/e/magnetic-force-on-moving-charges",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetism-and-moving-charges/e/properties-of-magnetic-force-on-charged-particle",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetism-and-moving-charges/quiz/x0e2f5a2c:magnetism-and-electromagnetism-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetism-and-current-carrying-wires/e/apply-magnetic-field-due-to-straight-current-carrying-conductor",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetism-and-current-carrying-wires/e/apply-force-on-a-current-carrying-conductor-in-a-magnetic-field",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:electromagnetic-induction/e/faraday-s-law-magnitude-of-induced-emf-average",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:electromagnetic-induction/e/lenz-s-law-iii",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:electromagnetic-induction/quiz/x0e2f5a2c:magnetism-and-electromagnetism-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism/x0e2f5a2c:magnetic-properties-materials/test/x0e2f5a2c:magnetism-and-electromagnetism-unit-test",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:reflection-and-mirrors/e/applications-of-concave-and-convex-mirrors",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:reflection-and-mirrors/e/ray-diagrams",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:reflection-and-mirrors/e/ray-diagrams-and-curved-mirrors",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:reflection-and-mirrors/quiz/x0e2f5a2c:geometric-optics-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:mirror-formula-and-magnification/e/sign-conventions",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:mirror-formula-and-magnification/e/using-mirror-formula",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:mirror-formula-and-magnification/e/using-the-magnification-formula",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:mirror-formula-and-magnification/e/nature-of-image-given-magnification",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:mirror-formula-and-magnification/e/concave-and-convex-mirrors",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:mirror-formula-and-magnification/quiz/x0e2f5a2c:geometric-optics-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:refraction/e/snell-s-law-of-refraction",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:refraction/e/reflection-and-refraction",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:refraction/quiz/x0e2f5a2c:geometric-optics-quiz-3",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/paths-of-light-rays-through-spherical-lenses",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/lenses-and-ray-diagrams",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/thin-lens-intuition",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/using-the-lens-formula",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/using-magnification-formula-for-lenses",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/convex-and-concave-lenses",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/e/thin-lenses-questions",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/quiz/x0e2f5a2c:geometric-optics-quiz-4",
      "/science/ap-physics-2/x0e2f5a2c:geometric-optics/x0e2f5a2c:lenses/test/x0e2f5a2c:geometric-optics-unit-test",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-properties/e/transverse-and-longitudinal-wave-exercises-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-properties/e/wave-characteristics-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-properties/e/numerical-wave-equation-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-properties/e/graphical-wave-equation-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-properties/quiz/x0e2f5a2c:waves-sound-and-physical-optics-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-behaviors/e/wave-interference-ap-physics-1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-behaviors/e/standing-waves-ap-physics-1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-behaviors/e/standing-waves-part-2-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:wave-behaviors/quiz/x0e2f5a2c:waves-sound-and-physical-optics-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:sound/e/intro-to-sound-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:sound/e/beats-ap-physics-1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:sound/e/doppler-effect-ap1",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:sound/quiz/x0e2f5a2c:waves-sound-and-physical-optics-quiz-3",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:diffraction-and-interference-of-light/e/calculate-path-difference-in-ydse",
      "/science/ap-physics-2/x0e2f5a2c:waves-sound-and-physical-optics/x0e2f5a2c:diffraction-and-interference-of-light/test/x0e2f5a2c:waves-sound-and-physical-optics-unit-test",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:wave-particle-duality/e/de-broglie-equation",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:atoms-and-light/e/apply-atomic-spectra",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:atoms-and-light/e/electronic-transitions",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:atoms-and-light/e/kinetic-energy-of-emitted-electrons",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:atoms-and-light/e/einstein-photoelectric-equation",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:atoms-and-light/quiz/x0e2f5a2c:modern-physics-quiz-1",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/understand-radioactive-decay",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/identify-type-of-decay",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/apply-alpha-beta-gamma",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/understand-half-life-and-radiometric-dating",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/apply-half-life-and-radiometric-dating",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/understand-nuclear-fusion",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/understand-nuclear-fission",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/e/apply-nuclear-fission",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/quiz/x0e2f5a2c:modern-physics-quiz-2",
      "/science/ap-physics-2/x0e2f5a2c:modern-physics/x0e2f5a2c:nuclear-physics/test/x0e2f5a2c:modern-physics-unit-test",
    ];

    const links = [...apPhysics1Links, ...apPhysics2Links];

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

      let course = "AP Physics";
      if (link.includes("ap-college-physics-1")) {
        course = "AP Physics 1";
      } else if (link.includes("ap-physics-2")) {
        course = "AP Physics 2";
      }

      let topic = course;
      for (const part of parts) {
        if (part.match(/x[a-f0-9]+:/)) {
          const extractedTopic = part
            .split(":")[1]
            .replace(/-/g, " ")
            .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
          topic = `${course} - ${extractedTopic}`;
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