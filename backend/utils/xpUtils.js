const { XP_TIERS } = require('../config/xpConfig'); 

function tierForXp(xp) {
  const tiers = [
    { min: 0,    tier: 'Rookie'  },
    { min: 200,  tier: 'Learner' },
    { min: 500,  tier: 'Builder' },
    { min: 1000, tier: 'Expert'  },
    { min: 2000, tier: 'Master'  },
  ];
  let result = tiers[0].tier;
  for (const { min, tier } of tiers) {
    if (xp >= min) result = tier;
  }
  return result;
}

async function awardXP(sequelize, User, userId, amount, countsProblem = false) {
  if (!amount || amount <= 0) return;
  const inc = {
    xp:              sequelize.literal(`xp + ${Number(amount)}`),
    total_xp_earned: sequelize.literal(`total_xp_earned + ${Number(amount)}`),
  };
  if (countsProblem) inc.problems_solved = sequelize.literal('problems_solved + 1');
  await User.update(inc, { where: { id: userId } });

  const user = await User.findByPk(userId, { attributes: ['xp', 'level_tier'] });
  if (user) {
    const newTier = tierForXp(user.xp);
    const tierUpdate = { level_tier: newTier };
    if (newTier !== user.level_tier)
      tierUpdate.last_tier_change_date = new Date().toISOString().slice(0, 10);
    await User.update(tierUpdate, { where: { id: userId } });
  }
}

async function logActivity(User, userId, action, xp = 0) {
  const user = await User.findByPk(userId, { attributes: ['activity_log'] });
  if (!user) return;
  const today    = new Date().toISOString().slice(0, 10);
  const existing = Array.isArray(user.activity_log) ? user.activity_log : [];
  const idx      = existing.findIndex(e => e.date === today && e.action === action);
  if (idx >= 0) {
    existing[idx].xp    = (existing[idx].xp    || 0) + xp;
    existing[idx].count = (existing[idx].count  || 1) + 1;
  } else {
    existing.push({ date: today, action, xp, count: 1 });
  }
  const cutoff = new Date(Date.now() - 84 * 86400000).toISOString().slice(0, 10);
  await User.update(
    { activity_log: existing.filter(e => e.date >= cutoff) },
    { where: { id: userId } }
  );
}

module.exports = { awardXP, logActivity, tierForXp };
