from pydantic import BaseModel, Field
from typing import List, Dict

class TaskStatusCount(BaseModel):
    status: str = Field(..., description="The name of the status (e.g., pending, completed)")
    count: int = Field(..., description="Number of tasks currently in this status")

class UserAnalytics(BaseModel):
    total_tasks: int = Field(..., description="Total number of tasks owned by the user")
    completed_tasks: int = Field(..., description="Number of tasks marked as completed")
    pending_tasks: int = Field(..., description="Number of tasks still pending completion")
    tasks_by_priority: Dict[str, int] = Field(..., description="Mapping of priority levels to task counts")
    tasks_by_status: List[TaskStatusCount] = Field(..., description="Detailed breakdown of tasks by status")

class SystemAnalytics(UserAnalytics):
    total_users: int = Field(..., description="Total number of registered users in the system")
    active_users: int = Field(..., description="Number of users who have been active recently")
