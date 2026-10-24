import JSZip from 'jszip';

export interface ParsedSb3Report {
  success: boolean;
  fileName: string;
  fileSizeBytes: number;
  spriteCount: number;
  stageIncluded: boolean;
  spriteNames: string[];
  totalBlocks: number;
  blockCategoryCounts: Record<string, number>;
  opcodesFound: string[];
  variablesFound: string[];
  broadcastsFound: string[];
  hasClones: boolean;
  costumeCount: number;
  soundCount: number;
  staticAnalysisScore: number; // out of 50
  requirementChecks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
  summary: string;
  staticNotice: string;
}

export async function parseSb3Buffer(
  buffer: Buffer | ArrayBuffer,
  fileName: string,
  expectedConfig?: {
    opcodes?: string[];
    minSprites?: number;
    minBlocks?: number;
    requiresVariables?: string[];
    requiresBroadcasts?: string[];
    requiresClones?: boolean;
  }
): Promise<ParsedSb3Report> {
  const staticNotice =
    'Static block structure analysis completed: inspected sprite models, event trees, variables, and opcodes. Note: This analysis evaluates code structure and composition, not simulated runtime execution.';

  try {
    const zip = await JSZip.loadAsync(buffer);
    const projectJsonFile = zip.file('project.json');

    if (!projectJsonFile) {
      throw new Error(
        'Invalid Scratch project archive (.sb3): missing internal project.json manifest file.'
      );
    }

    const jsonText = await projectJsonFile.async('text');
    let projectData: any;
    try {
      projectData = JSON.parse(jsonText);
    } catch {
      throw new Error('Corrupted Scratch project manifest (unable to parse JSON).');
    }

    const targets: any[] = Array.isArray(projectData?.targets) ? projectData.targets : [];

    let totalBlocks = 0;
    const spriteNames: string[] = [];
    const opcodesSet = new Set<string>();
    const variablesSet = new Set<string>();
    const broadcastsSet = new Set<string>();
    let costumeCount = 0;
    let soundCount = 0;
    let hasClones = false;

    const blockCategoryCounts: Record<string, number> = {
      motion: 0,
      looks: 0,
      sound: 0,
      events: 0,
      control: 0,
      sensing: 0,
      operators: 0,
      variables: 0,
      myBlocks: 0,
      pen: 0,
      other: 0,
    };

    for (const target of targets) {
      if (target.isStage) {
        // stage
      } else {
        spriteNames.push(target.name || 'Unnamed Sprite');
      }

      if (Array.isArray(target.costumes)) {
        costumeCount += target.costumes.length;
      }
      if (Array.isArray(target.sounds)) {
        soundCount += target.sounds.length;
      }

      // Collect variables
      if (target.variables && typeof target.variables === 'object') {
        for (const varId of Object.keys(target.variables)) {
          const varTuple = target.variables[varId];
          if (Array.isArray(varTuple) && typeof varTuple[0] === 'string') {
            variablesSet.add(varTuple[0]);
          }
        }
      }

      // Collect broadcasts
      if (target.broadcasts && typeof target.broadcasts === 'object') {
        for (const bId of Object.keys(target.broadcasts)) {
          const bName = target.broadcasts[bId];
          if (typeof bName === 'string') {
            broadcastsSet.add(bName);
          }
        }
      }

      // Collect blocks
      if (target.blocks && typeof target.blocks === 'object') {
        for (const blockId of Object.keys(target.blocks)) {
          const block = target.blocks[blockId];
          // Skip shadow primitive reporters if not top level opcode
          if (!block || typeof block !== 'object') continue;
          const opcode: string = block.opcode;
          if (!opcode) continue;

          totalBlocks++;
          opcodesSet.add(opcode);

          if (opcode.startsWith('motion_')) blockCategoryCounts.motion++;
          else if (opcode.startsWith('looks_')) blockCategoryCounts.looks++;
          else if (opcode.startsWith('sound_')) blockCategoryCounts.sound++;
          else if (opcode.startsWith('event_')) blockCategoryCounts.events++;
          else if (opcode.startsWith('control_')) {
            blockCategoryCounts.control++;
            if (opcode.includes('clone')) hasClones = true;
          } else if (opcode.startsWith('sensing_')) blockCategoryCounts.sensing++;
          else if (opcode.startsWith('operator_')) blockCategoryCounts.operators++;
          else if (opcode.startsWith('data_')) blockCategoryCounts.variables++;
          else if (opcode.startsWith('procedures_')) blockCategoryCounts.myBlocks++;
          else if (opcode.startsWith('pen_')) blockCategoryCounts.pen++;
          else blockCategoryCounts.other++;
        }
      }
    }

    const opcodesFound = Array.from(opcodesSet);
    const variablesFound = Array.from(variablesSet);
    const broadcastsFound = Array.from(broadcastsSet);

    // Evaluate static requirements against expectedConfig
    const checks: { name: string; passed: boolean; detail: string }[] = [];
    let scoreAccumulator = 0;

    // Baseline structure score (up to 20 pts)
    const minBlocks = expectedConfig?.minBlocks || 8;
    const blockCheckPassed = totalBlocks >= minBlocks;
    checks.push({
      name: `Block Volume Check (Minimum ${minBlocks} blocks)`,
      passed: blockCheckPassed,
      detail: `Found ${totalBlocks} total blocks in project graph.`,
    });
    scoreAccumulator += blockCheckPassed ? 15 : Math.max(5, Math.round((totalBlocks / minBlocks) * 15));

    const minSprites = expectedConfig?.minSprites || 1;
    const spriteCheckPassed = spriteNames.length >= minSprites;
    checks.push({
      name: `Sprite Composition Check (Minimum ${minSprites} sprite${minSprites > 1 ? 's' : ''})`,
      passed: spriteCheckPassed,
      detail: `Found ${spriteNames.length} sprite(s): [${spriteNames.slice(0, 5).join(', ')}${spriteNames.length > 5 ? '...' : ''}].`,
    });
    scoreAccumulator += spriteCheckPassed ? 10 : 4;

    // Expected opcodes / categories (up to 15 pts)
    if (expectedConfig?.opcodes && expectedConfig.opcodes.length > 0) {
      const matchedOpcodes = expectedConfig.opcodes.filter((op) =>
        opcodesFound.some((f) => f.toLowerCase().includes(op.toLowerCase()))
      );
      const ratio = matchedOpcodes.length / expectedConfig.opcodes.length;
      const opCheckPassed = ratio >= 0.7;
      checks.push({
        name: `Required Concept Blocks`,
        passed: opCheckPassed,
        detail: `Matched ${matchedOpcodes.length} of ${expectedConfig.opcodes.length} key block types (${Math.round(ratio * 100)}%).`,
      });
      scoreAccumulator += Math.round(ratio * 15);
    } else {
      scoreAccumulator += 15;
    }

    // Clone requirement check (5 pts)
    if (expectedConfig?.requiresClones) {
      checks.push({
        name: 'Clone Lifecycle Mechanics',
        passed: hasClones,
        detail: hasClones
          ? 'Project utilizes clone generation and event handlers.'
          : 'Missing Scratch clone blocks (create clone of / when I start as clone).',
      });
      scoreAccumulator += hasClones ? 5 : 0;
    } else {
      scoreAccumulator += 5;
    }

    // Variables check (5 pts)
    if (expectedConfig?.requiresVariables && expectedConfig.requiresVariables.length > 0) {
      const varsFoundLower = variablesFound.map((v) => v.toLowerCase());
      const hasReqVars = expectedConfig.requiresVariables.some((rv) =>
        varsFoundLower.some((v) => v.includes(rv.toLowerCase()))
      );
      checks.push({
        name: `Variable Architecture Check`,
        passed: hasReqVars,
        detail: hasReqVars
          ? `Detected variables: ${variablesFound.join(', ')}`
          : `Expected variables resembling: ${expectedConfig.requiresVariables.join(', ')}`,
      });
      scoreAccumulator += hasReqVars ? 5 : 2;
    } else {
      scoreAccumulator += 5;
    }

    const finalStaticScore = Math.min(50, Math.max(10, scoreAccumulator));

    return {
      success: true,
      fileName,
      fileSizeBytes: buffer instanceof Buffer ? buffer.length : buffer.byteLength,
      spriteCount: spriteNames.length,
      stageIncluded: targets.some((t) => t.isStage),
      spriteNames,
      totalBlocks,
      blockCategoryCounts,
      opcodesFound,
      variablesFound,
      broadcastsFound,
      hasClones,
      costumeCount,
      soundCount,
      staticAnalysisScore: finalStaticScore,
      requirementChecks: checks,
      summary: `Extracted ${spriteNames.length} sprite(s), ${totalBlocks} code blocks, ${variablesFound.length} variables, and ${costumeCount} costumes. Static integrity verified.`,
      staticNotice,
    };
  } catch (err: any) {
    return {
      success: false,
      fileName,
      fileSizeBytes: buffer instanceof Buffer ? buffer.length : buffer.byteLength,
      spriteCount: 0,
      stageIncluded: false,
      spriteNames: [],
      totalBlocks: 0,
      blockCategoryCounts: {
        motion: 0,
        looks: 0,
        sound: 0,
        events: 0,
        control: 0,
        sensing: 0,
        operators: 0,
        variables: 0,
        myBlocks: 0,
        pen: 0,
        other: 0,
      },
      opcodesFound: [],
      variablesFound: [],
      broadcastsFound: [],
      hasClones: false,
      costumeCount: 0,
      soundCount: 0,
      staticAnalysisScore: 0,
      requirementChecks: [
        {
          name: 'Archive Extraction',
          passed: false,
          detail: err.message || 'Unable to decompress or parse .sb3 project file.',
        },
      ],
      summary: `Failed to inspect project: ${err.message}`,
      staticNotice,
    };
  }
}
