from pydantic import BaseModel
from typing import List, Dict

class TaskStatusCount(BaseModel):
    status: str
    count: int

class UserAnalytics(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    tasks_by_priority: Dict[str, int]
    tasks_by_status: List[TaskStatusCount]

class SystemAnalytics(UserAnalytics):
    total_users: int
    active_users: int
