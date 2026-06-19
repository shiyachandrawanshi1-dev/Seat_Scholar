from django.db import models

class Room(models.Model):
    room_no = models.CharField(max_length=50)
    floor = models.CharField(max_length=50)
    capacity = models.IntegerField()
    
    # 👈 NEW: Rows aur Columns ke naye fields yahan jod diye hain
    rows = models.IntegerField(default=0)     
    columns = models.IntegerField(default=0)  

    def __str__(self):
        return self.room_no

class Student(models.Model):
    roll_no = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    branch = models.CharField(max_length=50)
    semester = models.CharField(max_length=50)
    
    # Naye fields screenshot ke hisab se add kiye gaye hain
    subject_code = models.CharField(max_length=20, null=True, blank=True)
    subject_name = models.CharField(max_length=150, null=True, blank=True)

    def __str__(self):
        return f"{self.roll_no} - {self.name}"
    
# Agar aapke paas ExamSession model hai toh use bhi check kar lijiye
class ExamSession(models.Model):
    subject_code = models.CharField(max_length=50)
    subject_name = models.CharField(max_length=100)
    exam_date = models.DateField()
    exam_time = models.TimeField()
    semester = models.IntegerField()

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name}"

# ... aapke purane models yahan khatam honge

class SeatingPlan(models.Model):
    exam = models.ForeignKey(ExamSession, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    plan_data = models.JSONField() # Yahan matrix ka sara data save hoga
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan for {self.exam.subject_code} in {self.room.room_no}"

