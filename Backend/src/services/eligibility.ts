/**
 * BenefitAI Deterministic Eligibility Engine
 * 
 * Uses an Abstract Syntax Tree (AST) approach to evaluate user profiles against 
 * dynamic scheme rules stored in the database.
 */

export interface RuleAST {
  and?: RuleAST[];
  or?: RuleAST[];
  not?: RuleAST;
  "=="?: [RuleCondition, any];
  "!="?: [RuleCondition, any];
  ">"?: [RuleCondition, number];
  "<"?: [RuleCondition, number];
  ">="?: [RuleCondition, number];
  "<="?: [RuleCondition, number];
  "in"?: [RuleCondition, any[]];
  "contains"?: [RuleCondition, any];
}

export interface RuleCondition {
  var: string;
}

export interface EvaluationResult {
  isEligible: boolean;
  matchPercentage: number;
  missingCriteria: string[];
}

export class EligibilityEvaluator {
  private profile: Record<string, any>;

  constructor(profile: Record<string, any>) {
    this.profile = profile;
  }

  /**
   * Main entry point to evaluate a scheme's rules against the profile
   */
  public evaluate(rules: RuleAST): EvaluationResult {
    const missing: string[] = [];
    const isEligible = this.parseNode(rules, missing);
    
    // For now, simple matching: if eligible 100%, else 0%
    // Can be expanded to handle "preferred" vs "required" criteria
    return {
      isEligible,
      matchPercentage: isEligible ? 100 : 0,
      missingCriteria: missing
    };
  }

  private parseNode(node: RuleAST, missing: string[]): boolean {
    if (node.and) {
      return node.and.every(child => this.parseNode(child, missing));
    }
    if (node.or) {
      const results = node.or.map(child => {
        const localMissing: string[] = [];
        const result = this.parseNode(child, localMissing);
        return { result, localMissing };
      });
      
      const isTrue = results.some(r => r.result);
      if (!isTrue) {
        // Collect all missing criteria from OR conditions
        results.forEach(r => missing.push(...r.localMissing));
      }
      return isTrue;
    }
    if (node.not) {
      return !this.parseNode(node.not, []);
    }

    // Process Leaves
    const operator = Object.keys(node)[0];
    const args = node[operator as keyof RuleAST] as [RuleCondition, any];
    
    if (!args || !args[0] || !args[0].var) {
      return false; // Invalid rule node
    }

    const field = args[0].var;
    const expectedValue = args[1];
    const actualValue = this.profile[field];

    let result = false;
    switch (operator) {
      case '==': result = actualValue === expectedValue; break;
      case '!=': result = actualValue !== expectedValue; break;
      case '>': result = actualValue > expectedValue; break;
      case '<': result = actualValue < expectedValue; break;
      case '>=': result = actualValue >= expectedValue; break;
      case '<=': result = actualValue <= expectedValue; break;
      case 'in': result = Array.isArray(expectedValue) && expectedValue.includes(actualValue); break;
      case 'contains': result = Array.isArray(actualValue) && actualValue.includes(expectedValue); break;
      default: result = false;
    }

    if (!result) {
      missing.push(`Requirement not met for ${field}. Expected ${operator} ${expectedValue}, got ${actualValue}`);
    }

    return result;
  }
}
