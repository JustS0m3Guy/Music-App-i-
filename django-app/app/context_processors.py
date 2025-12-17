def redirect_url(request):
    return {'redirect_to': request.get_full_path()}