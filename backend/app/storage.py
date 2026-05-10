from __future__ import annotations

import json
import os
import threading
from pathlib import Path
from typing import Any


EMPTY_STATE: dict[str, Any] = {
    "documents": [],
    "chapters": [],
    "nodes": [],
    "edges": [],
    "decisions": [],
    "compression": {
        "original_char_count": 0,
        "integrated_char_count": 0,
        "compression_ratio": 0,
        "compression_percent": 0,
        "target_ratio": 0.3,
        "within_target": False,
        "method": "",
    },
    "citations": [],
    "feedback_events": [],
    "runtime": {},
}


class JsonStateStore:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> dict[str, Any]:
        if not self.path.exists():
            return dict(EMPTY_STATE)
        with self.path.open("r", encoding="utf-8") as source:
            return json.load(source)

    def save(self, state: dict[str, Any]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.path.with_name(
            f".{self.path.name}.{os.getpid()}.{threading.get_ident()}.tmp"
        )
        with tmp_path.open("w", encoding="utf-8") as target:
            json.dump(state, target, ensure_ascii=False, indent=2)
        tmp_path.replace(self.path)
