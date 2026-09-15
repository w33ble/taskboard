const STORAGE_KEY = "taskboard.board.project";

/**
 * The board the user last opened, remembered across reloads.
 * Returns null when nothing is remembered or storage is unavailable.
 */
export function readLastBoardProject(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Remember the current board. An empty id clears the memory ("All boards"). */
export function writeLastBoardProject(projectId: string): void {
  try {
    if (projectId) {
      window.localStorage.setItem(STORAGE_KEY, projectId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode, cookies disabled). The board
    // still works — the selection just is not remembered.
  }
}
