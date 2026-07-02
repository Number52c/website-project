/**
 * Scheduled Health Check Job
 * Runs daily at 6 AM to monitor system health
 */

import { runHealthCheck, formatHealthCheckResult } from "./health-check";
import { notifyOwner } from "./_core/notification";

/**
 * Initialize scheduled health check
 * Runs at 6 AM every morning
 */
export function initializeScheduledHealthCheck() {
  // Schedule health check for 6 AM daily
  const scheduleHealthCheck = async () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(6, 0, 0, 0);

    // If it's already past 6 AM, schedule for tomorrow
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilHealthCheck = scheduledTime.getTime() - now.getTime();

    // Set timeout for first run
    setTimeout(() => {
      runDailyHealthCheck();
      // Then run every 24 hours
      setInterval(runDailyHealthCheck, 24 * 60 * 60 * 1000);
    }, timeUntilHealthCheck);

    console.log(
      `[Health Check] Scheduled for ${scheduledTime.toLocaleString()} (in ${Math.round(timeUntilHealthCheck / 1000 / 60)} minutes)`
    );
  };

  scheduleHealthCheck();
}

/**
 * Run daily health check
 */
async function runDailyHealthCheck() {
  try {
    console.log("[Health Check] Starting daily health check...");

    const result = await runHealthCheck();
    const formattedReport = formatHealthCheckResult(result);

    // Log the report
    console.log(formattedReport);

    // If there are failures or warnings, notify the owner
    if (result.status !== "healthy") {
      const summary = `Health Check Alert: ${result.status.toUpperCase()}
- Passed: ${result.summary.passed}/${result.summary.totalChecks}
- Warnings: ${result.summary.warnings}
- Failures: ${result.summary.failed}

Failed Checks:
${result.checks
  .filter((c) => c.status === "fail")
  .map((c) => `- ${c.name}: ${c.message}`)
  .join("\n")}

${
  result.checks.filter((c) => c.status === "warning").length > 0
    ? `\nWarnings:\n${result.checks
        .filter((c) => c.status === "warning")
        .map((c) => `- ${c.name}: ${c.message}`)
        .join("\n")}`
    : ""
}`;

      try {
        await notifyOwner({
          title: `🚨 System Health Check: ${result.status.toUpperCase()}`,
          content: summary,
        });
      } catch (notifyError) {
        console.error("[Health Check] Failed to send notification:", notifyError);
      }
    } else {
      // Log success
      console.log("[Health Check] ✓ All systems healthy!");
    }

    // Store health check result in logs
    logHealthCheckResult(result);
  } catch (error) {
    console.error("[Health Check] Error running health check:", error);

    // Notify owner of health check failure
    try {
      await notifyOwner({
        title: "🚨 Health Check Failed",
        content: `The daily health check encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } catch (notifyError) {
      console.error("[Health Check] Failed to send error notification:", notifyError);
    }
  }
}

/**
 * Log health check result
 */
function logHealthCheckResult(result: any) {
  const logEntry = {
    timestamp: result.timestamp,
    status: result.status,
    summary: result.summary,
    checks: result.checks.map((c: any) => ({
      name: c.name,
      status: c.status,
      message: c.message,
    })),
  };

  // In production, store this in a database or log file
  console.log("[Health Check] Result stored:", JSON.stringify(logEntry, null, 2));
}

/**
 * Get last health check result
 */
export async function getLastHealthCheckResult() {
  try {
    const result = await runHealthCheck();
    return result;
  } catch (error) {
    return {
      timestamp: new Date(),
      status: "critical" as const,
      checks: [
        {
          name: "Health Check Execution",
          status: "fail" as const,
          message: `Failed to run health check: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      summary: {
        totalChecks: 1,
        passed: 0,
        failed: 1,
        warnings: 0,
      },
    };
  }
}
