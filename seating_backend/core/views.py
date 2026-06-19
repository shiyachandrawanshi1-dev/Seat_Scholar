import csv
import io
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status, viewsets, serializers
from .models import Student, Room, ExamSession, SeatingPlan
from .serializers import StudentSerializer, RoomSerializer, ExamSessionSerializer, SeatingPlanSerializer

# ==============================================================================
# 1. SERIALIZERS (Updated with SeatingPlan)
# ==============================================================================
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
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

# ==============================================================================
# 2. VIEWSETS
# ==============================================================================
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]

class ExamSessionViewSet(viewsets.ModelViewSet):
    queryset = ExamSession.objects.all()
    serializer_class = ExamSessionSerializer
    permission_classes = [AllowAny]

# ==============================================================================
# 3. AUTHENTICATION VIEWS
# ==============================================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if not username or not email or not password:
            return Response({'error': 'Sabhi fields bharein!'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username pehle se maujood hai!'}, status=status.HTTP_400_BAD_REQUEST)
        User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'Registration successful!'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==============================================================================
# 4. DASHBOARD, BULK UPLOAD & SEATING PLAN LOGIC
# ==============================================================================
@api_view(['GET'])
def dashboard_view(request):
    return Response({
        "total_students": Student.objects.count(),
        "total_rooms": Room.objects.count(),
        "total_exams": ExamSession.objects.count(),
        "total_plans": SeatingPlan.objects.count()
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def bulk_upload_students(request):
    csv_file = request.FILES.get('file')
    if not csv_file:
        return Response({"error": "File nahi mili!"}, status=status.HTTP_400_BAD_REQUEST)
    
    data_set = csv_file.read().decode('UTF-8')
    io_string = io.StringIO(data_set)
    next(io_string) # Skip header
    
    students_to_create = []
    for row in csv.reader(io_string):
        students_to_create.append(Student(
            roll_no=row[0], name=row[1], branch=row[2], 
            semester=row[3], subject_code=row[4], subject_name=row[5]
        ))
    Student.objects.bulk_create(students_to_create, ignore_conflicts=True)
    return Response({"message": "Upload Success!"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def save_seating_plan(request):
    serializer = SeatingPlanSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Plan saved successfully!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_seating_plans(request):
    plans = SeatingPlan.objects.all()
    serializer = SeatingPlanSerializer(plans, many=True)
    return Response(serializer.data)