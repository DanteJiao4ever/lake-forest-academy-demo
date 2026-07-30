const CONDITION_TYPES = new Set([
  "source_module_completed",
  "required_activity_completed",
  "required_activity_evidence_present",
  "all_gradebook_components_published",
]);

export function evaluateUnlockPolicy(policy, facts = {}) {
  if (
    !policy ||
    policy.version !== 1 ||
    policy.operator !== "all" ||
    !["next_module", "course_completion"].includes(policy.scope) ||
    !Array.isArray(policy.conditions) ||
    policy.conditions.length < 3
  ) {
    return { valid: false, satisfied: false, unmet: ["invalid_policy"] };
  }

  const unmet = [];
  for (const condition of policy.conditions) {
    const type = condition?.type;
    if (!CONDITION_TYPES.has(type)) {
      return { valid: false, satisfied: false, unmet: ["invalid_policy"] };
    }
    if (!facts[type]) unmet.push(type);
  }
  return { valid: true, satisfied: unmet.length === 0, unmet };
}

export function policyRequires(policy, conditionType) {
  return Boolean(
    evaluateUnlockPolicy(
      policy,
      Object.fromEntries([...CONDITION_TYPES].map((type) => [type, true])),
    ).valid && policy.conditions.some((condition) => condition.type === conditionType),
  );
}
