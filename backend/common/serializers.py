from rest_framework import serializers


class GenericIdSerializer(serializers.Serializer):
    id = serializers.UUIDField()


class GenericIdAndNameSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()


class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()
    detail = serializers.CharField(required=False)


class PaginatedResponseSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = serializers.ListField()
