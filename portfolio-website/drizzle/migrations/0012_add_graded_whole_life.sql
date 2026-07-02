-- Add graded_whole_life to policyType enum
ALTER TABLE policies MODIFY COLUMN policyType ENUM(
  'term_life',
  'whole_life',
  'graded_whole_life',
  'universal_life',
  'variable_universal_life',
  'fixed_annuity',
  'variable_annuity',
  'indexed_annuity',
  'immediate_annuity',
  'disability',
  'critical_illness',
  'other'
) NOT NULL;
