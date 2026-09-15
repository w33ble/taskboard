import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { readLastBoardProject, writeLastBoardProject } from "../lib/lastBoard";

/**
 * The project selected across the app. The Board and the Tickets view share a
 * single selection: the URL is the source of truth while a view is mounted, and
 * the last non-empty choice is mirrored to localStorage so a bare "/" or
 * "/tickets" restores it instead of falling back to "All projects".
 */
export function useSelectedProject() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProject = searchParams.get("project") ?? "";

  const selectProject = useCallback(
    (id: string) => {
      // Written synchronously so nav links cannot read a stale value in the
      // same commit that clears the selection ("All projects").
      writeLastBoardProject(id);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (id) {
          next.set("project", id);
        } else {
          next.delete("project");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    // Only ever records a project. Clearing is an explicit act ("All projects")
    // and happens synchronously in selectProject, so landing on a bare URL does
    // not forget the project the user was on.
    if (selectedProject) writeLastBoardProject(selectedProject);
  }, [selectedProject]);

  return {
    selectedProject,
    selectProject,
    rememberedProject: readLastBoardProject(),
  };
}
