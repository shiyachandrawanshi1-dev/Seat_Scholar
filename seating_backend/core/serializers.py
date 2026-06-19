from rest_framework import serializers
from .models import SeatingPlan, Student, Room, ExamSession

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        # '__all__' likhne se model ke saare naye aur purane fields automatically serialize ho jaate hain
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class ExamSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSession
        fields = '__all__'

class SeatingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatingPlan
        fields = '__all__'